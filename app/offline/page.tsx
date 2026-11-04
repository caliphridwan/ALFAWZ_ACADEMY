import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

// Cached by the service worker and shown when a page can't be reached.
export default function OfflinePage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-5xl" aria-hidden="true">📡</p>
      <h1 className="mt-6 text-3xl font-bold">You&apos;re offline</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        AlFawz Academy needs an internet connection to load your classes. Check your connection and try again.
      </p>
      {/* An empty href reloads the page the student was trying to open. */}
      <a
        href=""
        className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Try again
      </a>
    </div>
  );
}
