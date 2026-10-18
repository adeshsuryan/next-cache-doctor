import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // Webhook: no client router cache exists for this caller, so plain
  // revalidateTag is the correct invalidation primitive here.
  revalidateTag("products:123");
  return Response.json({ ok: true });
}
