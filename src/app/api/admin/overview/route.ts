import {
  db,
  products,
  productCategories,
  mediaLibrary,
  inquiries,
  activityLogs,
  productDocuments,
} from "@/db";
import { count, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { ensureDatabaseSeeded } from "@/db/seed";

export async function GET() {
  try {
    await ensureDatabaseSeeded();
    const { errorResponse } = await requireAuth("dashboard.view");
    if (errorResponse) return errorResponse;

    const [{ value: totalProducts }] = await db
      .select({ value: count() })
      .from(products);
    const [{ value: activeProducts }] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.status, "published"));
    const [{ value: draftProducts }] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.status, "draft"));
    const [{ value: totalCategories }] = await db
      .select({ value: count() })
      .from(productCategories);
    const [{ value: totalMedia }] = await db
      .select({ value: count() })
      .from(mediaLibrary);
    const [{ value: totalInquiries }] = await db
      .select({ value: count() })
      .from(inquiries);
    const [{ value: newInquiries }] = await db
      .select({ value: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new"));

    const recentActivities = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);

    const mostViewedProducts = await db
      .select({
        id: products.id,
        nameEn: products.nameEn,
        nameAr: products.nameAr,
        sku: products.sku,
        slug: products.slug,
        viewCount: products.viewCount,
        status: products.status,
      })
      .from(products)
      .orderBy(desc(products.viewCount))
      .limit(5);

    const latestDocuments = await db
      .select({
        id: productDocuments.id,
        productId: productDocuments.productId,
        docType: productDocuments.docType,
        titleEn: productDocuments.titleEn,
        fileName: productDocuments.fileName,
        fileUrl: productDocuments.fileUrl,
        createdAt: productDocuments.createdAt,
      })
      .from(productDocuments)
      .orderBy(desc(productDocuments.createdAt))
      .limit(6);

    return Response.json({
      stats: {
        totalProducts: Number(totalProducts),
        activeProducts: Number(activeProducts),
        draftProducts: Number(draftProducts),
        totalCategories: Number(totalCategories),
        totalMedia: Number(totalMedia),
        totalInquiries: Number(totalInquiries),
        newInquiries: Number(newInquiries),
      },
      recentActivities,
      mostViewedProducts,
      latestDocuments,
    });
  } catch (err) {
    console.error("GET /api/admin/overview error:", err);
    return Response.json(
      { error: "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
