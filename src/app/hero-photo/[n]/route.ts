import p0 from "@/lib/hero/p0";
import p1 from "@/lib/hero/p1";
import p2 from "@/lib/hero/p2";

const photos = [p0, p1, p2];

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ n: "0" }, { n: "1" }, { n: "2" }];
}

export async function GET(_req: Request, ctx: { params: Promise<{ n: string }> }) {
  const { n } = await ctx.params;
  const data = photos[Number(n)];
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(data, "base64"), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
