import { BookOpenCheck, Users, Globe2, HeartHandshake } from "lucide-react";

const REASONS = [
  {
    icon: BookOpenCheck,
    title: "Structured Curriculum",
    description:
      "Clear levels from beginner recitation through advanced Qur'an, Hadith, Fiqh and Tafseer — you always know what's next.",
  },
  {
    icon: Users,
    title: "Qualified Teachers",
    description:
      "Live classes led by dedicated teachers who guide students with patience and care, not pre-recorded lessons.",
  },
  {
    icon: Globe2,
    title: "Learn From Anywhere",
    description:
      "Join online from Nigeria or the wider diaspora — all you need is an internet connection and a willingness to learn.",
  },
  {
    icon: HeartHandshake,
    title: "A Supportive Community",
    description:
      "Through our sponsorship program, students who couldn't otherwise afford it are given the same access to learn.",
  },
];

export function WhyChoose() {
  return (
    <section className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose AlFawz Academy</h2>
        <p className="text-muted-foreground">
          A few things that set structured Islamic education apart from
          learning on your own.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {REASONS.map((r) => (
          <div key={r.title} className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand mb-4">
              <r.icon size={22} />
            </span>
            <h3 className="font-semibold mb-2">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
