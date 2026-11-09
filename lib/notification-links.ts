/**
 * Where a student's notification should take them when it is clicked. The
 * destination is worked out from the notification's title, so every existing
 * notification is clickable too (no stored link needed). Returns null when
 * there is nowhere useful to go, and the notification stays plain text.
 */
export function notificationHref(title: string): string | null {
  const t = title.toLowerCase();
  if (/recording|class starting|classes are starting|missed you in class/.test(t)) return "/dashboard/schedule";
  if (/recitation/.test(t)) return "/dashboard/recitations";
  if (/scholarship/.test(t)) return "/dashboard/scholarship";
  if (/certificate|enrollment confirmed/.test(t)) return "/dashboard/courses";
  if (/payment|bank transfer|receipt/.test(t)) return "/dashboard/payments";
  if (/course reminder/.test(t)) return "/courses";
  return null;
}
