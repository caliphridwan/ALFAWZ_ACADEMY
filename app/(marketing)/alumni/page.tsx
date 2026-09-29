import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Alumni",
  description:
    "Meet graduates of AlFawz Academy and see where their Qur'an and Islamic education journey has taken them. Join our alumni network.",
};

export default async function AlumniPage() {
  // Explicit select: private columns (email, consent, review status) are
  // never fetched by this public page.
  const alumni = await prisma.alumnus.findMany({
    where: { published: true },
    select: {
      id: true,
      name: true,
      photo: true,
      graduationYear: true,
      program: true,
      currentRole: true,
      location: true,
      story: true,
      linkedinUrl: true,
      featured: true,
    },
    orderBy: [{ featured: "desc" }, { graduationYear: "desc" }],
  });

  const featured = alumni.filter((a) => a.featured);
  const rest = alumni.filter((a) => !a.featured);

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Alumni</h1>
        <p className="text-muted-foreground">
          Graduates of AlFawz Academy carrying what they learned into their
          studies, careers, and communities — wherever they are in the
          world.
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6 text-center">
            Featured Stories
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {featured.map((a) => (
              <AlumnusCard key={a.id} alumnus={a} featured />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rest.map((a) => (
            <AlumnusCard key={a.id} alumnus={a} />
          ))}
        </div>
      )}

      {alumni.length === 0 && (
        <p className="text-muted-foreground text-center mb-16">
          Alumni stories will be added here soon.
        </p>
      )}

      {/* Alumni network CTA */}
      <div className="rounded-xl bg-brand text-brand-foreground p-10 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Join the Alumni Network</h2>
        <p className="text-brand-foreground/80 mb-6">
          Graduated from AlFawz Academy? We&apos;d love to stay connected —
          register to be featured here, share your story, or mentor current
          students. Submissions are reviewed before they appear.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/alumni/join">Register as Alumni</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-brand-foreground/40 text-brand-foreground hover:bg-brand-foreground/10">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlumnusCard({
  alumnus,
  featured = false,
}: {
  alumnus: {
    id: string;
    name: string;
    photo: string | null;
    graduationYear: number;
    program: string;
    currentRole: string | null;
    location: string | null;
    story: string;
    linkedinUrl: string | null;
  };
  featured?: boolean;
}) {
  return (
    <Card className={featured ? "border-gold/40" : undefined}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-brand/10 overflow-hidden shrink-0 relative">
            {alumnus.photo && (
              <Image src={alumnus.photo} alt={alumnus.name} fill className="object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold">{alumnus.name}</p>
            <p className="text-xs text-muted-foreground">
              {alumnus.program} · Class of {alumnus.graduationYear}
            </p>
            {alumnus.currentRole && (
              <p className="text-xs text-brand mt-0.5">{alumnus.currentRole}</p>
            )}
          </div>
        </div>
        <p className={`text-sm text-muted-foreground ${featured ? "" : "line-clamp-4"}`}>
          {alumnus.story}
        </p>
        <div className="flex items-center justify-between mt-4">
          {alumnus.location && <Badge variant="muted">{alumnus.location}</Badge>}
          {alumnus.linkedinUrl && (
            <a
              href={alumnus.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-brand"
              aria-label={`${alumnus.name} on LinkedIn`}
            >
              <Linkedin size={16} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
