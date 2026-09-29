import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ phoneNumber }: { phoneNumber?: string | null }) {
  if (!phoneNumber) return null;
  const digits = phoneNumber.replace(/[^\d]/g, "");

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <MessageCircle size={26} />
    </a>
  );
}
