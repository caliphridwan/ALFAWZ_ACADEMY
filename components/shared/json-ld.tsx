export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify + this component is the standard safe way to embed
  // structured data in Next.js — no user input is interpolated raw here.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
