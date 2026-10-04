const STEPS = [
  {
    title: "Enroll in a Course",
    description: "Choose the program that fits your age and current level, and complete secure registration.",
  },
  {
    title: "Join Live Online Classes",
    description: "Attend structured sessions with a qualified teacher, following a clear curriculum.",
  },
  {
    title: "Track Your Progress",
    description: "Move through your course with your dashboard showing your enrollment status along the way.",
  },
  {
    title: "Complete & Advance",
    description: "Sit your exams — pass, and you're ready to apply for the next cohort.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 border-y border-border">
      <div className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">How Learning Works</h2>
          <p className="text-muted-foreground">From enrollment to completion, in four steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm font-semibold mb-4">
                {i + 1}
              </span>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
