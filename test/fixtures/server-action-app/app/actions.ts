"use server";

import { revalidateTag } from "next/cache";

export async function saveOrder() {
  // Server Action: callers DO have a router cache — this still needs
  // an immediate invalidation plus a client refresh to be visible.
  revalidateTag("orders");
}
