import { db, inquiries } from "@/db";
import { count, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Number of inquiries still marked "new". Drives the badge in the admin menu.
export async function GET() {
  const { errorResponse } = await requireAuth("inquiries.read");
  if (errorResponse) return errorResponse;
  const [row] = await db
    .select({ n: count() })
    .from(inquiries)
    .where(eq(inquiries.status, "new"));
  return Response.json({ count: Number(row?.n ?? 0) });
}
