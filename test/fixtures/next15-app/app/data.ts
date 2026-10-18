"use cache";

import { unstable_cache, revalidateTag } from "next/cache";

export const getProducts = unstable_cache(
  async () => fetch("https://api.example/products").then((r) => r.json()),
  ["products"],
  { tags: ["products"] }
);

export async function bust() {
  revalidateTag("products");
}
