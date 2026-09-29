import { Wrench } from "lucide-react";

export const metadata = { title: "Under Maintenance" };

/**
 * Not wired into middleware by default — enable by setting a
 * MAINTENANCE_MODE=true environment variable and adding a short-circuit at
 * the top of middleware.ts that redirects all traffic here, if/when you
 * need to take the site down for planned maintenance.
 */
export default function MaintenancePage() {
  return (
    <div className="container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      <Wrench className="text-brand mb-6" size={48} />
      <h1 className="text-3xl font-bold mb-2">We&apos;ll be right back</h1>
      <p className="text-muted-foreground">
        AlFawz Academy is undergoing scheduled maintenance. Please check back
        shortly — Jazakumullahu khaira for your patience.
      </p>
    </div>
  );
}
