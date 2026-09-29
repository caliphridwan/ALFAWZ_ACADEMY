import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about AlFawz Academy's online courses, enrollment, payments and sponsorship.",
};

const FAQS = [
  { q: "How do online classes work?", a: "Classes are delivered live online by qualified teachers, following a structured curriculum for your level." },
  { q: "How do I register?", a: "Create an account, choose a course, and complete registration — parents/guardians register on behalf of students under 18." },
  { q: "How do I pay?", a: "Course payments are processed securely through Paystack, supporting major cards and bank transfers." },
  { q: "Can children join?", a: "Yes — we offer an Under-9 Program and age-appropriate classes for younger learners, with guardian information required at registration." },
  { q: "Can students outside Nigeria join?", a: "Yes — our Diaspora Program is designed for students learning from anywhere in the world." },
  { q: "How does sponsorship work?", a: "Sponsors choose how many students to support, pay securely through Paystack, and their sponsorship activates immediately upon confirmed payment." },
  { q: "Can I sponsor multiple students?", a: "Yes — use the sponsorship calculator to choose any number of students, including a custom amount." },
  { q: "How do I become a sponsor?", a: "Visit the Sponsorship page, choose how many students to support, and complete the secure payment." },
  { q: "Can I remain anonymous?", a: "Yes — sponsors choose at checkout whether their name appears publicly, or whether to be listed as an Anonymous Sponsor." },
  { q: "How often do sponsorship payments occur?", a: "You choose a sponsorship duration at checkout. Recurring automatic billing is not yet enabled — you can renew manually from your sponsor dashboard." },
];

export default function FaqPage() {
  return (
    <div className="container py-16 max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-10">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {FAQS.map((f) => (
          <div key={f.q} className="border-b border-border pb-6">
            <h2 className="font-semibold mb-2">{f.q}</h2>
            <p className="text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
