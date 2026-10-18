export default async function Page() {
  const data = await fetch("https://api.example/catalog", {
    next: { revalidate: 300, tags: ["catalog"] },
  });
  return data;
}
