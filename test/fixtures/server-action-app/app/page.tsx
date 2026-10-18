export default async function Page() {
  const data = await fetch("https://api.example/orders", {
    next: { tags: ["orders"] },
  });
  return data;
}
