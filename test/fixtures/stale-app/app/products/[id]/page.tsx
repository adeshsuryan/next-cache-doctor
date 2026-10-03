export const revalidate = 300;

export default async function Page() {
  const product = await fetch(`https://shop.example/products/123`, {
    next: { revalidate: 300, tags: ["products:123", "products"] },
  });
  return product;
}
