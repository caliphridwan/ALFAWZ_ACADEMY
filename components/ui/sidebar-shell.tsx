"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

/**
 * Wraps a dashboard's menu. On large screens it is the usual fixed side
 * column. On phones the menu is hidden behind a "Menu" bar and slides in from
 * the left; it closes by itself when a link is tapped or the page changes,
 * and also with the X, the dim background or the Escape key.
 */
export function SidebarShell({
  title = "Menu",
  badge = 0,
  children,
}: {
  title?: string;
  /** Total of the counters inside the menu, shown on the Menu button. */
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Phones: slim bar under the site header */}
      <div className="lg:hidden sticky top-16 z-40 flex items-center border-b border-border bg-card px-4 py-2">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium"
        >
          <Menu size={20} />
          {title}
          {badge > 0 && (
            <span
              className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground"
              aria-label={`${badge} items need attention`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/40 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute left-0 top-0 h-full w-[80%] max-w-xs overflow-y-auto bg-card p-4 shadow-xl"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
              onClick={(e) => {
                e.stopPropagation();
                // Any link tapped inside the menu closes it.
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <div className="mb-2 flex justify-end">
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                  <X size={24} />
                </button>
              </div>
              {children}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: the normal side column */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-card">{children}</aside>
    </>
  );
}
