"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

function Count({ n, label }: { n: number; label: string }) {
  if (n <= 0) return null;
  return (
    <span
      className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground"
      aria-label={`${n} ${label}`}
      title={`${n} ${label}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function TeacherNav({
  name,
  recitationsToReview = 0,
  assessmentsToMark = 0,
  unreadChat = 0,
}: {
  name: string;
  recitationsToReview?: number;
  assessmentsToMark?: number;
  unreadChat?: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <Link href="/teacher" className="text-lg font-bold">
          Teacher portal
        </Link>
        <p className="text-xs text-muted-foreground">Signed in as {name}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/teacher">
            My courses
            <Count n={recitationsToReview + assessmentsToMark + unreadChat} label="items waiting for you" />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
