export default async function Page() {
  const data = await fetch("https://api.example/status", {
    next: { revalidate: 300 },
  });
  return data;
}
