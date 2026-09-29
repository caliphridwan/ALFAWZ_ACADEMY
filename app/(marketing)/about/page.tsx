import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story, mission and educational philosophy of AlFawz Academy.",
};

const SECTIONS = [
  {
    title: "Our Mission",
    body: "To make authentic Islamic education accessible to Muslims everywhere through structured, well-detailed, and engaging online classes.",
  },
  {
    title: "Our Vision",
    // Placeholder — replace with the institution's real vision statement via admin content settings.
    body: "[Add AlFawz Academy's vision statement here.]",
  },
  {
    title: "Our Educational Philosophy",
    body: "Learning is structured across clear levels — from foundational recitation through to advanced Qur'an, Hadith, Fiqh and Tafseer — so every student progresses at a pace suited to them.",
  },
  {
    title: "Global Reach",
    body: "AlFawz Academy serves students across Nigeria and the wider diaspora, wherever they are in the world.",
  },
];

export default function AboutPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-10">About AlFawz Academy</h1>
      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
