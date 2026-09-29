import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      <ShieldAlert className="text-destructive mb-6" size={48} />
      <h1 className="text-3xl font-bold mb-2">You don&apos;t have access to this page</h1>
      <p className="text-muted-foreground mb-8">
        This area is restricted. If you believe this is a mistake, please contact support.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
