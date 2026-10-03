"use cache";

export async function saveProduct() {
  await revalidateTag("products:123", "max");
}
