/* Student ID card, front and back. Credit-card size (85.6 x 54 mm).
 * Every measurement is in cqw (a % of the card's own width), so the same
 * markup looks right on a phone screen and prints at exactly 85.6 mm wide. */

const NAVY = "#1e3a8a";
const DEEP = "#14275f";
const GOLD = "#c9a24b";
const ARABIC_FONT = "Amiri, 'Noto Naskh Arabic', 'Geeza Pro', 'Traditional Arabic', 'Times New Roman', serif";

export type IdCardData = {
  name: string;
  studentNumber: string;
  photoUrl: string | null;
  programme: string;
  memberSince: number;
  logoUrl: string | null;
  verifyUrl: string;
  qrDataUrl: string;
  contactEmail: string | null;
  phone: string | null;
  directorName: string | null;
  directorTitle: string;
  signatureUrl: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const shell: React.CSSProperties = {
  containerType: "inline-size",
  aspectRatio: "85.6 / 54",
  position: "relative",
  overflow: "hidden",
  borderRadius: "4cqw",
};

export function IdCardFront({ d }: { d: IdCardData }) {
  return (
    <div className="id-card" style={shell}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${NAVY} 0%, ${DEEP} 100%)`,
        }}
      />
      {/* faint star watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-6cqw",
          bottom: "-14cqw",
          fontSize: "62cqw",
          lineHeight: 1,
          color: "#fff",
          opacity: 0.06,
        }}
      >
        ✦
      </div>
      {/* gold inner frame */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "1.6cqw",
          border: `0.3cqw solid ${GOLD}`,
          borderRadius: "3cqw",
          opacity: 0.85,
        }}
      />

      {/* header */}
      <div style={{ position: "absolute", left: "5cqw", right: "5cqw", top: "4.4cqw", display: "flex", alignItems: "center", gap: "2.4cqw" }}>
        {d.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.logoUrl}
            alt=""
            style={{ height: "9cqw", width: "9cqw", borderRadius: "1.6cqw", objectFit: "cover", background: "#fff" }}
          />
        ) : null}
        <div style={{ color: "#fff", lineHeight: 1.1 }}>
          <div dir="rtl" lang="ar" style={{ fontSize: "4.4cqw", fontWeight: 700, fontFamily: ARABIC_FONT, lineHeight: 1.2 }}>
            أكاديمية الفوز
          </div>
          <div style={{ fontSize: "3.6cqw", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
            AlFawz Academy
          </div>
          <div style={{ fontSize: "1.9cqw", letterSpacing: "0.3em", color: GOLD, marginTop: "0.5cqw", fontWeight: 600 }}>
            STUDENT IDENTITY CARD
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ position: "absolute", left: "5cqw", right: "5cqw", top: "17cqw", display: "flex", gap: "4cqw", alignItems: "flex-start" }}>
        <div
          style={{
            height: "28cqw",
            width: "22cqw",
            flex: "none",
            borderRadius: "2cqw",
            overflow: "hidden",
            border: `0.5cqw solid ${GOLD}`,
            background: "#e8eefc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: NAVY,
            fontSize: "8cqw",
            fontWeight: 700,
            fontFamily: "Georgia, serif",
          }}
        >
          {d.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.photoUrl} alt="" style={{ height: "100%", width: "100%", objectFit: "cover" }} />
          ) : (
            initials(d.name)
          )}
        </div>

        <div style={{ color: "#fff", minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: d.name.length > 24 ? "4.6cqw" : "5.6cqw",
              fontWeight: 700,
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {d.name}
          </div>
          <div style={{ marginTop: "2.2cqw", fontSize: "2cqw", letterSpacing: "0.18em", color: GOLD, fontWeight: 600 }}>
            STUDENT NO.
          </div>
          <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "4.2cqw", fontWeight: 600, letterSpacing: "0.04em" }}>
            {d.studentNumber}
          </div>
          <div style={{ marginTop: "1.8cqw", fontSize: "2cqw", letterSpacing: "0.18em", color: GOLD, fontWeight: 600 }}>
            PROGRAMME
          </div>
          <div style={{ fontSize: "3.2cqw", lineHeight: 1.2 }}>{d.programme}</div>
        </div>
      </div>

      {/* footer strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "7.4cqw",
          background: GOLD,
          color: DEEP,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5cqw",
          fontSize: "2.5cqw",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        <span>Learn the Qur&apos;an. Understand Your Deen.</span>
        <span>Since 2023</span>
      </div>
    </div>
  );
}

export function IdCardBack({ d }: { d: IdCardData }) {
  return (
    <div className="id-card" style={{ ...shell, background: "#fffdf7", border: "1px solid #e5dcc3" }}>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: "6cqw", background: NAVY, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "2cqw", fontWeight: 700,
        }}
      >
        <span dir="rtl" lang="ar" style={{ fontSize: "3.4cqw", fontFamily: ARABIC_FONT }}>أكاديمية الفوز</span>
        <span style={{ color: GOLD }}>•</span>
        <span style={{ fontSize: "2.6cqw", letterSpacing: "0.14em", textTransform: "uppercase" }}>AlFawz Academy</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "6cqw", height: "0.7cqw", background: GOLD }} />

      <div style={{ position: "absolute", left: "5cqw", right: "5cqw", top: "10cqw", display: "flex", gap: "4cqw" }}>
        <div style={{ flex: "none", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.qrDataUrl} alt="QR code to verify this card" style={{ height: "24cqw", width: "24cqw", display: "block" }} />
          <div style={{ marginTop: "1cqw", fontSize: "2cqw", color: "#475569", letterSpacing: "0.1em" }}>SCAN TO VERIFY</div>
        </div>

        <div style={{ minWidth: 0, flex: 1, fontSize: "2.6cqw", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: "3cqw" }}>{d.name}</div>
          <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "2.6cqw", marginBottom: "1.6cqw" }}>
            {d.studentNumber}
          </div>
          This card identifies the holder as a student of AlFawz Academy and remains the academy&apos;s property. If
          found, please contact:
          <div style={{ marginTop: "1cqw", color: NAVY, fontWeight: 600, wordBreak: "break-word" }}>
            {d.contactEmail && <div>{d.contactEmail}</div>}
            {d.phone && <div>{d.phone}</div>}
            <div>alfawzacademy.com</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: "5cqw", bottom: "3.6cqw", width: "30cqw", textAlign: "center" }}>
        <div style={{ height: "8cqw", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          {d.signatureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.signatureUrl}
              alt=""
              style={{ maxHeight: "8cqw", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
            />
          )}
        </div>
        <div style={{ borderTop: "0.25cqw solid #94a3b8", marginTop: "0.6cqw", paddingTop: "0.6cqw", fontSize: "2.2cqw", color: "#475569" }}>
          {d.directorName && <div style={{ fontWeight: 700, color: "#0f172a" }}>{d.directorName}</div>}
          <div style={{ letterSpacing: "0.08em" }}>{d.directorTitle.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "5cqw", bottom: "3.6cqw", fontSize: "2cqw", color: "#64748b", maxWidth: "40cqw" }}>
        Issued by AlFawz Academy
      </div>
    </div>
  );
}
