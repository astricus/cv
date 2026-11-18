import { NAME, ROLE, SECTIONS } from "@/data/sections";
import SectionBlocks from "./SectionBlocks";

/**
 * The whole CV as plain HTML. Always server-rendered so crawlers and screen readers
 * get the content; shown on screen when `open` (no WebGL, no JS, or requested).
 */
export default function TextCv({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  return (
    <article id="cv" className={`text-cv${open ? " open" : ""}`} aria-label="CV (text version)">
      <div className="text-cv-inner">
        <header className="text-cv-head">
          <div>
            <p className="text-cv-name">{NAME}</p>
            <p className="text-cv-role">{ROLE}</p>
          </div>
          {open && onClose && (
            <button className="link-btn" onClick={onClose}>
              Back to 3D view
            </button>
          )}
        </header>
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            className="text-cv-section"
            style={{ "--accent": s.color } as React.CSSProperties}
          >
            <h2>{s.name}</h2>
            <p className="info-tagline">{s.tagline}</p>
            <SectionBlocks blocks={s.blocks} />
          </section>
        ))}
      </div>
    </article>
  );
}
