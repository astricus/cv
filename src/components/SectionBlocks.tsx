import type { ContentBlock } from "@/data/sections";

/** Renders a section's content blocks. Shared by the 3D info panel and the text version. */
export default function SectionBlocks({
  blocks,
  headingLevel = 3,
}: {
  blocks: ContentBlock[];
  headingLevel?: 3 | 4;
}) {
  const H = `h${headingLevel}` as const;

  return blocks.map((block, i) => (
    <section key={i} className="info-block">
      {block.heading && <H>{block.heading}</H>}
      {block.text && <p>{block.text}</p>}
      {block.items && (
        <ul>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      )}
      {block.tags && (
        <div className="tag-row">
          {block.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      {block.links && (
        <div className="link-row">
          {block.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-btn"
              download={link.download || undefined}
              {...(link.href.startsWith("http") && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  ));
}
