# Space Portfolio — Konstantin Romanenko

An interactive 3D portfolio built with Next.js and Three.js. A small solar system where each celestial object is a section of the CV: click a planet (or use the bottom nav) and the camera flies over to it, opening an info panel.

## Objects

| Object | Section |
| --- | --- |
| Homeworld (earth-like planet) | About / leadership / languages |
| Gas giant with rings | Experience |
| Orbital station | Skills |
| Comet with ion & dust tails | Education |
| Comms satellite | Contact |

## Tech

- **Next.js 16** (App Router, TypeScript)
- **three.js** via **@react-three/fiber**, **@react-three/drei** (textures, stars, controls) and **@react-three/postprocessing** (bloom, vignette)
- Planet surface maps in `public/textures/` (optimized WebP) are from [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0); glows, tails and the comet nucleus are generated procedurally
- Mobile friendly: touch orbit controls, portrait-aware camera distances, bottom-sheet info panel
- Deep links: `/?s=experience` opens a section directly

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Build

```bash
pnpm build
pnpm start
```

## Deploy

Set `NEXT_PUBLIC_SITE_URL` to the public URL (e.g. `https://example.com`). The canonical link, Open Graph/Twitter previews and the structured data resolve against it; without it they point at `localhost`. On Vercel the production domain is used automatically.

Analytics (PostHog EU, cookieless) is sent through `/ingest`, a rewrite in `next.config.ts`, so it needs a Next.js server or Vercel — not a static export.

## Text version

The full CV is also rendered as plain HTML (`src/components/TextCv.tsx`): always present for search engines and screen readers, shown on screen via the header's "Text version" button, `/?view=text`, or automatically when WebGL or JavaScript is unavailable.

## Where things live

- `src/data/sections.ts` — all CV content, section colors, 3D positions and camera distances
- `src/components/three/Scene.tsx` — canvas, camera rig (fly-to animation), controls, post-processing
- `src/components/three/CelestialObjects.tsx` — the five procedural models
- `src/components/three/textures.ts` — canvas-generated textures
- `src/components/Overlay.tsx` — HUD, nav chips, info panel
- `src/components/SectionBlocks.tsx` — renders section content (shared by the panel and the text version)
- `public/cv/` — downloadable CV PDFs (EN, IT)
