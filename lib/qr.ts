import "server-only";
import QRCode from "qrcode";

/** A QR code as a PNG data URL, in the academy's navy. */
export function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
}
