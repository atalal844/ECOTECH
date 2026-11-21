import { NextRequest, after } from "next/server";
import { notifyNewInquiry } from "@/lib/inquiry-notify";
import { z } from "zod";
import { db, inquiries, inquiryNotes, products } from "@/db";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

const createInquirySchema = z.object({
  inquiryType: z.enum(["quote", "contact", "sales"]).default("quote"),
  customerName: z.string().min(2).max(150),
  companyName: z.string().max(160).optional().nullable(),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(50),
  country: z.string().min(2).max(100),
  productId: z.number().int().positive().optional().nullable(),
  productNameSnapshot: z.string().max(240).optional().nullable(),
  quantity: z.string().max(80).optional().nullable(),
  message: z.string().min(5).max(3000),
});

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth("inquiries.read");
    if (errorResponse) return errorResponse;

    const sp = request.nextUrl.searchParams;
    const status = sp.get("status")?.trim() || "";
    const q = sp.get("q")?.trim() || "";

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(inquiries.status, status));
    }
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(inquiries.referenceCode, pattern),
          ilike(inquiries.customerName, pattern),
          ilike(inquiries.companyName, pattern),
          ilike(inquiries.email, pattern),
          ilike(inquiries.country, pattern),
          ilike(inquiries.productNameSnapshot, pattern)
        )
      );
    }

    const rows = await db
      .select()
      .from(inquiries)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(inquiries.createdAt));

    const ids = rows.map((r) => r.id);
    const notes =
      ids.length > 0
        ? await db
            .select()
            .from(inquiryNotes)
            .where(inArray(inquiryNotes.inquiryId, ids))
            .orderBy(desc(inquiryNotes.createdAt))
        : [];

    const enriched = rows.map((row) => ({
      ...row,
      notes: notes.filter((n) => n.inquiryId === row.id),
    }));

    return Response.json({ inquiries: enriched });
  } catch (err) {
    console.error("GET /api/inquiries error:", err);
    return Response.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`inquiry:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait before submitting another inquiry." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = createInquirySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Please complete all required inquiry fields accurately.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let productSnapshot = data.productNameSnapshot || null;
    if (data.productId && !productSnapshot) {
      const [prod] = await db
        .select({ nameEn: products.nameEn, sku: products.sku })
        .from(products)
        .where(eq(products.id, data.productId))
        .limit(1);
      if (prod) {
        productSnapshot = `${prod.nameEn} (${prod.sku})`;
      }
    }

    const refCode = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [created] = await db
      .insert(inquiries)
      .values({
        referenceCode: refCode,
        inquiryType: data.inquiryType,
        customerName: data.customerName.trim(),
        companyName: data.companyName?.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        country: data.country.trim(),
        productId: data.productId ?? null,
        productNameSnapshot: productSnapshot,
        quantity: data.quantity?.trim() || null,
        message: data.message.trim(),
        status: "new",
        ipAddress: ip,
      })
      .returning();

    await logActivity({
      action: "inquiry_submitted",
      entityType: "inquiry",
      entityId: created.id,
      details: {
        referenceCode: created.referenceCode,
        type: created.inquiryType,
        email: created.email,
      },
      ipAddress: ip,
    });

    after(() => notifyNewInquiry(created));

    return Response.json({ inquiry: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/inquiries error:", err);
    return Response.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}
