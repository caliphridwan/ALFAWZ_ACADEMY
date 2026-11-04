"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removePushSubscription, savePushSubscription, sendTestPush } from "@/app/dashboard/push-actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type Status = "loading" | "unsupported" | "needs-install" | "blocked" | "off" | "on";

async function currentRegistration() {
  // The service worker is only registered in production builds.
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

export function PushNotificationsCard() {
  const [status, setStatus] = useState<Status>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;

      // iPhones only allow push for sites added to the Home Screen.
      if (isIos && !standalone) return setStatus("needs-install");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        return setStatus("unsupported");
      }
      if (Notification.permission === "denied") return setStatus("blocked");

      const reg = await currentRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setStatus(sub && Notification.permission === "granted" ? "on" : "off");
    })().catch(() => setStatus("unsupported"));
  }, []);

  // Not set up on the server yet: show nothing rather than a broken button.
  if (!PUBLIC_KEY) return null;

  function enable() {
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatus(permission === "denied" ? "blocked" : "off");
          return;
        }
        const reg = await currentRegistration();
        if (!reg) {
          toast.error("Notifications will work once the site finishes loading. Refresh and try again.");
          return;
        }
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY!),
          }));
        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error("Bad subscription");
        await savePushSubscription({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
        setStatus("on");
        toast.success("Notifications turned on for this device.");
      } catch {
        toast.error("Could not turn on notifications. Please try again.");
      }
    });
  }

  function disable() {
    startTransition(async () => {
      try {
        const reg = await currentRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (sub) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setStatus("off");
        toast.success("Notifications turned off for this device.");
      } catch {
        toast.error("Could not turn off notifications.");
      }
    });
  }

  function test() {
    startTransition(async () => {
      try {
        const res = await sendTestPush();
        if (!res.configured) toast.error("Notifications aren't set up on the server yet.");
        else if (res.sent === 0) toast.error("Nothing was delivered. Try turning notifications off and on again.");
        else toast.success("Test sent — check your notifications.");
      } catch {
        toast.error("Could not send a test notification.");
      }
    });
  }

  if (status === "loading") return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {status === "on" ? (
            <Bell className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
          ) : (
            <BellOff className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
          <div className="flex-1">
            <p className="font-medium">Phone &amp; browser notifications</p>

            {status === "on" && (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  On for this device. You&apos;ll be notified about an hour before each class, and about updates to
                  your courses and payments.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={test} disabled={pending}>
                    Send a test
                  </Button>
                  <Button size="sm" variant="ghost" onClick={disable} disabled={pending}>
                    Turn off
                  </Button>
                </div>
              </>
            )}

            {status === "off" && (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get a reminder on this device about an hour before each class, even when the site isn&apos;t open.
                </p>
                <Button size="sm" className="mt-3" onClick={enable} disabled={pending}>
                  {pending ? "Turning on..." : "Turn on notifications"}
                </Button>
              </>
            )}

            {status === "blocked" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Notifications are blocked for this site. Allow them in your browser or phone settings (tap the
                padlock beside the web address → Notifications → Allow), then reload this page.
              </p>
            )}

            {status === "needs-install" && (
              <p className="mt-1 text-sm text-muted-foreground">
                On iPhone, first add AlFawz Academy to your Home Screen (Safari → Share → Add to Home Screen),
                open it from there, then come back to this page to turn notifications on.
              </p>
            )}

            {status === "unsupported" && (
              <p className="mt-1 text-sm text-muted-foreground">
                This browser doesn&apos;t support notifications. Try Chrome on Android, or Safari on iPhone with the
                site added to your Home Screen.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
