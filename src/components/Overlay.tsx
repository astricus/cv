"use client";

import { NAME, ROLE, SECTIONS } from "@/data/sections";
import SectionBlocks from "./SectionBlocks";

export default function Overlay({
  activeId,
  onSelect,
  onShowText,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onShowText: () => void;
}) {
  const section = SECTIONS.find((s) => s.id === activeId) ?? null;

  return (
    <>
      <header className="hud-header">
        <h1>{NAME}</h1>
        <p>{ROLE}</p>
        <div className="hud-actions">
          <a className="hud-btn" href="/cv/CV_Romanenko_EN.pdf" download>
            Download CV
          </a>
          <button className="hud-btn" onClick={onShowText}>
            Text version
          </button>
        </div>
      </header>

      {!section && (
        <p className="hud-hint" aria-hidden>
          Drag to orbit · tap an object to explore
        </p>
      )}

      <nav className="hud-nav" aria-label="Sections">
        <button
          className={`nav-chip${activeId === null ? " active" : ""}`}
          onClick={() => onSelect(null)}
        >
          Overview
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`nav-chip${activeId === s.id ? " active" : ""}`}
            style={{ "--accent": s.color } as React.CSSProperties}
            onClick={() => onSelect(s.id)}
          >
            {s.name}
          </button>
        ))}
      </nav>

      {section && (
        <aside className="info-panel" style={{ "--accent": section.color } as React.CSSProperties}>
          <div className="info-head">
            <div>
              <span className="info-object">{section.objectName}</span>
              <h2>{section.name}</h2>
              <p className="info-tagline">{section.tagline}</p>
            </div>
            <button className="info-close" onClick={() => onSelect(null)} aria-label="Close panel">
              ✕
            </button>
          </div>
          <div className="info-body">
            <SectionBlocks blocks={section.blocks} />
          </div>
        </aside>
      )}
    </>
  );
}
