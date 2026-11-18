"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Overlay from "@/components/Overlay";
import TextCv from "@/components/TextCv";
import { SECTIONS } from "@/data/sections";

const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  loading: () => (
    <div className="loader">
      <div className="loader-ring" />
      <p>Launching…</p>
    </div>
  ),
});

let webglCache: boolean | undefined;
function hasWebGL() {
  if (webglCache === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglCache = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noopSubscribe = () => () => {};

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [textRequested, setTextRequested] = useState(false);
  // the server assumes WebGL; the client corrects it before the scene mounts
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, () => true);
  const textOpen = textRequested || !webgl;

  // deep links: /?s=experience opens that section, /?view=text opens the text version
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("s");
    const text = params.get("view") === "text";
    if ((id && SECTIONS.some((s) => s.id === id)) || text) {
      const frame = requestAnimationFrame(() => {
        if (id) setActiveId(id);
        if (text) setTextRequested(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  const select = useCallback((id: string | null) => {
    setActiveId(id);
    const url = id ? `?s=${id}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, []);

  const showText = useCallback((show: boolean) => {
    setTextRequested(show);
    window.history.replaceState(null, "", show ? "?view=text" : window.location.pathname);
    if (show) document.getElementById("cv")?.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!textRequested) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && showText(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [textRequested, showText]);

  return (
    <>
      <main className="stage" inert={textOpen}>
        {webgl && <Scene activeId={activeId} onSelect={select} />}
        <Overlay activeId={activeId} onSelect={select} onShowText={() => showText(true)} />
      </main>
      <TextCv open={textOpen} onClose={webgl ? () => showText(false) : undefined} />
      <noscript>
        <style>{`.text-cv{position:fixed;inset:0;z-index:100;width:auto;height:auto;clip:auto;white-space:normal;overflow-y:auto;background:var(--bg)}`}</style>
      </noscript>
    </>
  );
}
