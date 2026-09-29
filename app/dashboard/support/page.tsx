import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SupportPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const whatsappDigits = settings?.whatsappNumber?.replace(/[^\d]/g, "");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Support</h1>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-1">Send us a message</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Questions about your course, payments or account? Use the contact form.
            </p>
            <Button asChild size="sm">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>

        {whatsappDigits && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-1">WhatsApp</h2>
              <p className="text-sm text-muted-foreground mb-4">Chat with us directly.</p>
              <Button asChild size="sm" variant="outline">
                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer">
                  Open WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-1">Frequently asked questions</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Answers about classes, payments and sponsorship.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/faq">Read the FAQ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
