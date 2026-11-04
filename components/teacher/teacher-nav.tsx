"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function TeacherNav({ name }: { name: string }) {
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
          <Link href="/teacher">My courses</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
