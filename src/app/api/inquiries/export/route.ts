import { db, inquiries } from "@/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

function csvCell(val: string | number | null | undefined): string {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  const { errorResponse } = await requireAuth("inquiries.read");
  if (errorResponse) return errorResponse;

  const rows = await db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt));

  const header = [
    "Reference",
    "Type",
    "Status",
    "Customer Name",
    "Company",
    "Email",
    "Phone",
    "Country",
    "Product of Interest",
    "Quantity",
    "Message",
    "Received At",
  ]
    .map(csvCell)
    .join(",");

  const lines = rows.map((r) =>
    [
      r.referenceCode,
      r.inquiryType,
      r.status,
      r.customerName,
      r.companyName,
      r.email,
      r.phone,
      r.country,
      r.productNameSnapshot,
      r.quantity,
      r.message,
      r.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(",")
  );

  // UTF-8 BOM for clean Excel opening with Arabic & English text
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ecotech-inquiries.csv"',
    },
  });
}
