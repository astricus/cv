import * as THREE from "three";

/** Soft radial glow sprite (sun halo, nebulae, comet coma). */
export function makeGlowTexture(inner: string, outer = "rgba(0,0,0,0)") {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Photovoltaic cell grid for spacecraft solar arrays. */
export function makeSolarPanelTexture(repeatX = 1, repeatY = 2) {
  const w = 256;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, "#0a1e4a");
  base.addColorStop(0.5, "#133a7a");
  base.addColorStop(1, "#0a1e4a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // individual cells with slight brightness variance
  const cw = 32;
  const ch = 64;
  for (let x = 0; x < w; x += cw) {
    for (let y = 0; y < h; y += ch) {
      const l = 22 + Math.random() * 14;
      ctx.fillStyle = `hsl(220, 62%, ${l}%)`;
      ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
      // cell sheen
      const sheen = ctx.createLinearGradient(x, y, x + cw, y + ch);
      sheen.addColorStop(0, "rgba(160,200,255,0.16)");
      sheen.addColorStop(0.5, "rgba(160,200,255,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
    }
  }
  // grid lines
  ctx.strokeStyle = "#060d20";
  ctx.lineWidth = 3;
  for (let x = 0; x <= w; x += cw) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += ch) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  return tex;
}

/** Crinkled gold multi-layer insulation foil, as on real satellite buses. */
export function makeFoilTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#9c7a1e";
  ctx.fillRect(0, 0, size, size);
  // crinkle facets
  for (let i = 0; i < 520; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const wd = 6 + Math.random() * 22;
    const ht = 4 + Math.random() * 14;
    const l = 28 + Math.random() * 44;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillStyle = `hsla(44, 70%, ${l}%, 0.85)`;
    ctx.fillRect(-wd / 2, -ht / 2, wd, ht);
    ctx.restore();
  }
  // bright specular streaks
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillStyle = "rgba(255,240,190,0.22)";
    ctx.fillRect(-20, -1.5, 40, 3);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}
