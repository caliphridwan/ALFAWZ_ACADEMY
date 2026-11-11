/* The certificate itself. Landscape A4 proportions (297 x 210). Every size is in
 * cqw (a % of the certificate's own width), so the same markup looks right on a
 * phone, a laptop and when printed, and always fits one page. */

const NAVY = "#1e3a8a";
const DEEP = "#14275f";
const GOLD = "#b8892b";
const GOLD_LIGHT = "#e7c872";
const INK = "#0f172a";
const ARABIC_FONT = "Amiri, 'Noto Naskh Arabic', 'Geeza Pro', 'Traditional Arabic', 'Times New Roman', serif";
const SERIF = "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";

export type CertificateData = {
  studentName: string;
  courseTitle: string;
  courseDuration: string | null;
  issuedOn: string; // already formatted
  certificateNumber: string;
  logoUrl: string | null;
  directorName: string | null;
  directorTitle: string;
  signatureUrl: string | null;
};

/** Faint 8-point-star lattice used as the paper background. */
function Lattice() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="afz-cert-lattice" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="scale(2.2)">
          <g fill="none" stroke={NAVY} strokeWidth="0.3">
            <rect x="2" y="2" width="8" height="8" />
            <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" />
            <circle cx="6" cy="6" r="1.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#afz-cert-lattice)" />
    </svg>
  );
}

/** One corner flourish, rotated into place by the caller. */
function Corner({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", width: "9cqw", height: "9cqw", ...style }}>
      <path d="M4 96 V4 H96" fill="none" stroke={GOLD} strokeWidth="3" />
      <path d="M14 96 V14 H96" fill="none" stroke={NAVY} strokeWidth="1" />
      <path d="M4 4 L42 4 L4 42 Z" fill={NAVY} opacity="0.12" />
      <circle cx="24" cy="24" r="7" fill="none" stroke={GOLD} strokeWidth="2" />
      <circle cx="24" cy="24" r="2.4" fill={GOLD} />
    </svg>
  );
}

/** Gold award seal with ribbon tails. */
function Seal() {
  const rays = Array.from({ length: 24 }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 150" aria-hidden="true" style={{ height: "11cqw", width: "8.8cqw" }}>
      <path d="M38 85 L24 142 L44 130 L56 146 L64 92 Z" fill={NAVY} />
      <path d="M82 85 L96 142 L76 130 L64 146 L56 92 Z" fill="#2748b0" />
      <g transform="translate(60 56)">
        {rays.map((i) => (
          <circle key={i} cx={Math.cos((i * Math.PI) / 12) * 46} cy={Math.sin((i * Math.PI) / 12) * 46} r="6" fill={GOLD} />
        ))}
        <circle r="46" fill={GOLD} />
        <circle r="38" fill={GOLD_LIGHT} stroke="#fff7d6" strokeWidth="2" />
        <circle r="31" fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="2 3" />
        <path d="M0 -20 L5.9 -6.2 L20.8 -6.4 L8.9 2.6 L13.5 16.8 L0 8 L-13.5 16.8 L-8.9 2.6 L-20.8 -6.4 L-5.9 -6.2 Z" fill={GOLD} />
      </g>
    </svg>
  );
}

function Divider({ width = "34cqw" }: { width?: string }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2cqw", color: GOLD, width, margin: "0 auto" }}>
      <span style={{ flex: 1, height: "0.18cqw", background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
      <span style={{ fontSize: "1.7cqw", lineHeight: 1 }}>✦</span>
      <span style={{ flex: 1, height: "0.18cqw", background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
    </div>
  );
}

/** A faded open Qur'an on a rehal (stand), with a halo of small stars, drawn as a watermark. */
function QuranWatermark() {
  // Lines of text on one page; the right page is the mirror image.
  const lines = Array.from({ length: 11 }, (_, i) => 84 + i * 10.2);
  const page = "M200 66 C 160 46, 100 46, 38 66 L 38 206 C 100 186, 160 186, 200 206 Z";
  const inner = "M192 80 C 156 63, 106 63, 50 80 L 50 192 C 106 177, 156 177, 192 192 Z";
  return (
    <svg
      viewBox="0 0 400 290"
      aria-hidden="true"
      style={{ position: "absolute", left: "50%", top: "52%", width: "60cqw", transform: "translate(-50%, -50%)", opacity: 0.075 }}
    >
      <defs>
        <clipPath id="afz-q-left"><path d={inner} /></clipPath>
        <clipPath id="afz-q-right"><path d={inner} transform="translate(400 0) scale(-1 1)" /></clipPath>
      </defs>

      {/* halo: ring of small stars behind the book */}
      <g fill={GOLD}>
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return <circle key={i} cx={200 + Math.cos(a) * 178} cy={140 + Math.sin(a) * 124} r={i % 2 ? 1.6 : 2.6} />;
        })}
      </g>
      <ellipse cx="200" cy="140" rx="168" ry="114" fill="none" stroke={GOLD} strokeWidth="1.2" />

      {/* rehal: the crossed wooden stand */}
      <g stroke={DEEP} strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M118 262 L 282 206" />
        <path d="M282 262 L 118 206" />
      </g>
      <path d="M96 205 L 304 205" stroke={DEEP} strokeWidth="7" strokeLinecap="round" />

      {/* cover edge */}
      <path d="M200 74 C 158 54, 96 54, 30 74 L 30 214 C 96 194, 158 194, 200 214 C 242 194, 304 194, 370 214 L 370 74 C 304 54, 242 54, 200 74 Z" fill={DEEP} />

      {/* pages */}
      <path d={page} fill="#fff" stroke={NAVY} strokeWidth="2" />
      <path d={page} transform="translate(400 0) scale(-1 1)" fill="#fff" stroke={NAVY} strokeWidth="2" />

      {/* framed text area, as on a printed mushaf */}
      <path d={inner} fill="none" stroke={GOLD} strokeWidth="2.2" />
      <path d={inner} transform="translate(400 0) scale(-1 1)" fill="none" stroke={GOLD} strokeWidth="2.2" />

      {/* lines of text */}
      <g clipPath="url(#afz-q-left)" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round">
        {lines.map((y, i) => (
          <path key={i} d={`M ${56 + (i % 3) * 3} ${y} q 70 -${9 - i * 0.2} ${134 - (i % 4) * 4} -${12 - i * 0.2}`} fill="none" />
        ))}
      </g>
      <g clipPath="url(#afz-q-right)" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round">
        {lines.map((y, i) => (
          <path key={i} d={`M ${344 - (i % 3) * 3} ${y} q -70 -${9 - i * 0.2} -${134 - (i % 4) * 4} -${12 - i * 0.2}`} fill="none" />
        ))}
      </g>

      {/* spine, and a gold ribbon marker */}
      <path d="M200 66 L200 206" stroke={NAVY} strokeWidth="2.5" />
      <path d="M208 70 L208 222 L216 212 L224 222 L224 74 Z" fill={GOLD} />
    </svg>
  );
}

export function CertificateSheet({ d }: { d: CertificateData }) {
  const nameSize = d.studentName.length > 34 ? "3.5cqw" : d.studentName.length > 24 ? "4.7cqw" : "5.8cqw";
  const courseSize = d.courseTitle.length > 44 ? "2.5cqw" : "3.2cqw";

  return (
    <div
      className="certificate-frame"
      style={{
        containerType: "inline-size",
        position: "relative",
        width: "100%",
        aspectRatio: "297 / 210",
        overflow: "hidden",
        background: "#fffdf7",
        color: INK,
        boxShadow: "0 1cqw 3cqw rgba(15,23,42,0.25)",
        breakInside: "avoid",
      }}
    >
      <Lattice />

      {/* triple border: navy, gold hairline, navy hairline */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, border: `1.1cqw solid ${NAVY}` }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: "1.7cqw", border: `0.25cqw solid ${GOLD}` }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: "2.3cqw", border: `0.1cqw solid ${NAVY}`, opacity: 0.55 }} />

      <Corner style={{ left: "2.4cqw", top: "2.4cqw" }} />
      <Corner style={{ right: "2.4cqw", top: "2.4cqw", transform: "rotate(90deg)" }} />
      <Corner style={{ right: "2.4cqw", bottom: "2.4cqw", transform: "rotate(180deg)" }} />
      <Corner style={{ left: "2.4cqw", bottom: "2.4cqw", transform: "rotate(-90deg)" }} />

      <QuranWatermark />

      <div
        style={{
          position: "relative",
          height: "100%",
          boxSizing: "border-box",
          padding: "4.4cqw 11cqw 3.4cqw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* header */}
        <div dir="rtl" lang="ar" style={{ fontSize: "1.7cqw", color: GOLD, fontFamily: ARABIC_FONT, lineHeight: 1.4 }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
        {d.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.logoUrl} alt="" style={{ height: "6cqw", width: "auto", objectFit: "contain", marginTop: "0.7cqw" }} />
        )}
        <div dir="rtl" lang="ar" style={{ marginTop: "0.3cqw", fontSize: "3.9cqw", fontWeight: 700, color: NAVY, fontFamily: ARABIC_FONT, lineHeight: 1.25 }}>
          أكاديمية الفوز
        </div>
        <div style={{ fontSize: "1.5cqw", fontWeight: 800, letterSpacing: "0.42em", textTransform: "uppercase", color: DEEP, paddingLeft: "0.42em" }}>
          AlFawz Academy
        </div>

        {/* title */}
        <h1
          style={{
            margin: "2.2cqw 0 0",
            whiteSpace: "nowrap",
            fontFamily: SERIF,
            fontSize: "3.6cqw",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: NAVY,
            lineHeight: 1.1,
          }}
        >
          Certificate of Completion
        </h1>
        <div style={{ marginTop: "1.1cqw", width: "100%" }}>
          <Divider />
        </div>

        {/* recipient */}
        <div style={{ marginTop: "2cqw", fontFamily: SERIF, fontSize: "1.6cqw", fontStyle: "italic", color: "#475569" }}>
          This is proudly presented to
        </div>
        <div
          style={{
            marginTop: "0.8cqw",
            maxWidth: "74cqw",
            padding: "0 3cqw 0.6cqw",
            borderBottom: `0.2cqw solid ${GOLD}`,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: nameSize,
            lineHeight: 1.2,
            color: NAVY,
          }}
        >
          {d.studentName}
        </div>

        <div style={{ marginTop: "1.8cqw", fontFamily: SERIF, fontSize: "1.6cqw", fontStyle: "italic", color: "#475569" }}>
          for successfully completing the course
        </div>
        <div style={{ marginTop: "0.7cqw", fontFamily: SERIF, fontSize: courseSize, fontWeight: 700, color: INK, lineHeight: 1.2, maxWidth: "76cqw" }}>
          {d.courseTitle}
        </div>
        {d.courseDuration && <div style={{ marginTop: "0.5cqw", fontSize: "1.3cqw", color: "#64748b" }}>Course duration: {d.courseDuration}</div>}

        {/* date, seal, signature */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "1cqw",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "start",
            gap: "2cqw",
          }}
        >
          <div style={{ fontSize: "1.25cqw", color: "#475569" }}>
            <div style={{ height: "4.4cqw", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: SERIF, fontSize: "1.9cqw", color: INK, lineHeight: 1.3 }}>
              {d.issuedOn}
            </div>
            <div style={{ margin: "0.3cqw auto 0", width: "20cqw", height: "0.12cqw", background: "#94a3b8" }} />
            <div style={{ marginTop: "0.4cqw", letterSpacing: "0.2em", textTransform: "uppercase" }}>Date of issue</div>
          </div>

          <div style={{ alignSelf: "end" }}>
            <Seal />
          </div>

          <div style={{ fontSize: "1.25cqw", color: "#475569" }}>
            <div style={{ height: "4.4cqw", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {d.signatureUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.signatureUrl}
                  alt={d.directorName ? `Signature of ${d.directorName}` : "Director's signature"}
                  style={{ maxHeight: "4.4cqw", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                />
              )}
            </div>
            <div style={{ margin: "0.3cqw auto 0", width: "20cqw", height: "0.12cqw", background: "#94a3b8" }} />
            {d.directorName && <div style={{ marginTop: "0.4cqw", fontFamily: SERIF, fontSize: "1.9cqw", color: INK, lineHeight: 1.3 }}>{d.directorName}</div>}
            <div style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>{d.directorTitle}</div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            marginTop: "1.2cqw",
            width: "100%",
            borderTop: `0.12cqw solid ${GOLD}88`,
            paddingTop: "0.9cqw",
            fontSize: "1.05cqw",
            color: "#64748b",
          }}
        >
          Certificate No. <span style={{ fontFamily: "ui-monospace, Menlo, monospace", color: "#334155" }}>{d.certificateNumber}</span> · Verify authenticity by
          opening this certificate&apos;s web address at alfawzacademy.com
        </div>
      </div>
    </div>
  );
}
