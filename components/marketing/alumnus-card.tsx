"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

// Roughly how many characters fit in 4 clamped lines at this card's width —
// only show "Read more" when the story is actually long enough to need it.
const TRUNCATE_THRESHOLD = 220;

export type AlumnusCardData = {
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

export function AlumnusCard({
  alumnus,
  featured = false,
}: {
  alumnus: AlumnusCardData;
  featured?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canTruncate = !featured && alumnus.story.length > TRUNCATE_THRESHOLD;

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

        <p
          className={`text-sm text-muted-foreground ${
            canTruncate && !expanded ? "line-clamp-4" : ""
          }`}
        >
          {alumnus.story}
        </p>

        {canTruncate && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 mt-1"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        )}

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
