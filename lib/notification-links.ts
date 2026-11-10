/**
 * The page a student's notification is about, worked out from its title (so
 * every existing notification has one too, with no stored link). Null when
 * there is no obvious page.
 */
export function notificationTarget(title: string): { href: string; label: string } | null {
  const t = title.toLowerCase();
  if (/recording|class starting|classes are starting|missed you in class/.test(t))
    return { href: "/dashboard/schedule", label: "Open my schedule" };
  if (/\b(assessment|final result|exam|quiz|test)s?\b/.test(t)) return { href: "/dashboard/assessments", label: "Open assessments" };
  if (/recitation/.test(t)) return { href: "/dashboard/recitations", label: "Open recitations" };
  if (/scholarship/.test(t)) return { href: "/dashboard/scholarship", label: "Open scholarship" };
  if (/certificate|enrollment confirmed/.test(t)) return { href: "/dashboard/courses", label: "Open my courses" };
  if (/payment|bank transfer|receipt/.test(t)) return { href: "/dashboard/payments", label: "Open payments" };
  if (/course reminder/.test(t)) return { href: "/courses", label: "Browse courses" };
  return null;
}

export function notificationHref(title: string): string | null {
  return notificationTarget(title)?.href ?? null;
}
