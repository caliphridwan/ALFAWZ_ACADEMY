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

/** Faint 8-point-star lattice, the classic Islamic geometric tile, as a card background. */
function Lattice({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="afz-lattice" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="scale(1.6)">
          <g fill="none" stroke={color} strokeWidth="0.35">
            <rect x="2" y="2" width="8" height="8" />
            <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" />
            <circle cx="6" cy="6" r="1.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#afz-lattice)" />
    </svg>
  );
}

const label: React.CSSProperties = { fontSize: "1.9cqw", letterSpacing: "0.2em", color: GOLD, fontWeight: 700 };

export function IdCardFront({ d }: { d: IdCardData }) {
  return (
    <div className="id-card" style={shell}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 90% at 85% 10%, #28479d 0%, ${NAVY} 38%, ${DEEP} 100%)`,
        }}
      />
      <Lattice color="#ffffff" opacity={0.07} />
      {/* soft gold glow, top right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-18cqw",
          top: "-22cqw",
          width: "52cqw",
          height: "52cqw",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}55 0%, transparent 65%)`,
        }}
      />
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

      {/* header: logo, name in Arabic and English, card type */}
      <div style={{ position: "absolute", left: "5.5cqw", right: "5.5cqw", top: "4.6cqw", display: "flex", alignItems: "center", gap: "3cqw" }}>
        {d.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.logoUrl}
            alt=""
            style={{
              height: "12cqw",
              width: "12cqw",
              flex: "none",
              borderRadius: "50%",
              objectFit: "cover",
              background: "#fff",
              border: `0.5cqw solid ${GOLD}`,
            }}
          />
        ) : null}
        <div style={{ color: "#fff", minWidth: 0, flex: 1, textAlign: "left" }}>
          <div dir="rtl" lang="ar" style={{ fontSize: "5.6cqw", fontWeight: 700, fontFamily: ARABIC_FONT, lineHeight: 1.2, textAlign: "left" }}>
            أكاديمية الفوز
          </div>
          <div
            style={{
              fontSize: "3.3cqw",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#f1d98f",
              marginTop: "0.4cqw",
            }}
          >
            AlFawz Academy
          </div>
        </div>
        <div
          style={{
            flex: "none",
            alignSelf: "flex-start",
            border: `0.3cqw solid ${GOLD}`,
            borderRadius: "10cqw",
            padding: "0.8cqw 2.2cqw",
            fontSize: "1.8cqw",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: GOLD,
            whiteSpace: "nowrap",
          }}
        >
          STUDENT ID
        </div>
      </div>

      {/* gold divider with a star */}
      <div style={{ position: "absolute", left: "5.5cqw", right: "5.5cqw", top: "20.2cqw", display: "flex", alignItems: "center", gap: "2cqw", color: GOLD }}>
        <span style={{ flex: 1, height: "0.25cqw", background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
        <span style={{ fontSize: "2.6cqw", lineHeight: 1 }}>✦</span>
        <span style={{ flex: 1, height: "0.25cqw", background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
      </div>

      {/* body */}
      <div style={{ position: "absolute", left: "5.5cqw", right: "5.5cqw", top: "24.5cqw", display: "flex", gap: "4.2cqw", alignItems: "flex-start" }}>
        <div
          style={{
            height: "27cqw",
            width: "21.5cqw",
            flex: "none",
            borderRadius: "2cqw",
            overflow: "hidden",
            border: `0.6cqw solid ${GOLD}`,
            boxShadow: "0 0.8cqw 2cqw rgba(0,0,0,0.35)",
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
              fontSize: d.name.length > 34 ? "3.9cqw" : d.name.length > 24 ? "4.4cqw" : "5.6cqw",
              fontWeight: 700,
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {d.name}
          </div>
          <div style={{ display: "flex", gap: "4cqw", marginTop: "2.4cqw" }}>
            <div>
              <div style={label}>STUDENT NO.</div>
              <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "3.9cqw", fontWeight: 700, letterSpacing: "0.04em" }}>
                {d.studentNumber}
              </div>
            </div>
            <div>
              <div style={label}>MEMBER SINCE</div>
              <div style={{ fontSize: "3.9cqw", fontWeight: 700 }}>{d.memberSince}</div>
            </div>
          </div>
          <div style={{ ...label, marginTop: "2cqw" }}>PROGRAMME</div>
          <div
            style={{
              fontSize: d.programme.length > 32 ? "2.7cqw" : "3.1cqw",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {d.programme}
          </div>
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
          background: `linear-gradient(90deg, #b8892b, ${GOLD} 40%, #e0c068 100%)`,
          color: DEEP,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5.5cqw",
          fontSize: "2.5cqw",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        <span>Learn the Qur&apos;an. Understand Your Deen.</span>
        <span dir="ltr">alfawzacademy.com</span>
      </div>
    </div>
  );
}

export function IdCardBack({ d }: { d: IdCardData }) {
  return (
    <div className="id-card" style={{ ...shell, background: "#fffdf7", border: "1px solid #e5dcc3" }}>
      <Lattice color={NAVY} opacity={0.06} />

      {/* header bar with the academy name */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: "8cqw",
          background: `linear-gradient(90deg, ${DEEP}, ${NAVY} 50%, ${DEEP})`, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "2.4cqw", fontWeight: 700,
        }}
      >
        <span dir="rtl" lang="ar" style={{ fontSize: "4cqw", fontFamily: ARABIC_FONT }}>أكاديمية الفوز</span>
        <span style={{ color: GOLD }}>✦</span>
        <span style={{ fontSize: "2.8cqw", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f1d98f" }}>AlFawz Academy</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "8cqw", height: "0.7cqw", background: GOLD }} />

      <div style={{ position: "absolute", left: "5.5cqw", right: "5.5cqw", top: "12.5cqw", display: "flex", gap: "4.5cqw" }}>
        <div style={{ flex: "none", textAlign: "center" }}>
          <div
            style={{
              padding: "1.4cqw", background: "#fff", borderRadius: "2cqw",
              border: `0.4cqw solid ${GOLD}`, boxShadow: "0 0.6cqw 1.6cqw rgba(20,39,95,0.15)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.qrDataUrl} alt="QR code to verify this card" style={{ height: "23cqw", width: "23cqw", display: "block" }} />
          </div>
          <div style={{ marginTop: "1.2cqw", fontSize: "1.9cqw", color: "#475569", letterSpacing: "0.16em", fontWeight: 600 }}>SCAN TO VERIFY</div>
        </div>

        <div style={{ minWidth: 0, flex: 1, fontSize: "2.5cqw", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: d.name.length > 26 ? "2.9cqw" : "3.4cqw", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>{d.name}</div>
          <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "2.6cqw", marginBottom: "2cqw", color: "#64748b" }}>
            {d.studentNumber}
          </div>
          This card is the property of AlFawz Academy and identifies the holder as its student.
          <div style={{ marginTop: "2cqw", fontSize: "1.8cqw", letterSpacing: "0.2em", color: "#9a7421", fontWeight: 700 }}>IF FOUND, PLEASE CONTACT</div>
          <div style={{ color: NAVY, fontWeight: 600, wordBreak: "break-word", fontSize: "2.6cqw" }}>
            {d.contactEmail && <div>{d.contactEmail}</div>}
            {d.phone && <div>{d.phone}</div>}
            {!d.contactEmail && !d.phone && <div>alfawzacademy.com</div>}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: "5.5cqw", bottom: "6.4cqw", width: "30cqw", textAlign: "center" }}>
        <div style={{ height: "7cqw", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          {d.signatureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.signatureUrl}
              alt=""
              style={{ maxHeight: "7cqw", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
            />
          )}
        </div>
        <div style={{ borderTop: "0.25cqw solid #94a3b8", marginTop: "0.6cqw", paddingTop: "0.6cqw", fontSize: "2cqw", color: "#475569" }}>
          {d.directorName && <div style={{ fontWeight: 700, color: "#0f172a" }}>{d.directorName}</div>}
          <div style={{ letterSpacing: "0.08em" }}>{d.directorTitle.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: "5.5cqw", bottom: "6.4cqw", fontSize: "1.9cqw", color: "#64748b", maxWidth: "40cqw", lineHeight: 1.4 }}>
        Valid while enrolled.
        <br />
        Issued by AlFawz Academy
      </div>

      {/* gold foot strip to echo the front */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "2.6cqw", background: `linear-gradient(90deg, #b8892b, ${GOLD} 40%, #e0c068 100%)` }} />
    </div>
  );
}
