import * as THREE from "three";

function headingFont() {
  if (typeof window === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--font-oxanium").trim();
  return value || "sans-serif";
}

function finish(canvas: HTMLCanvasElement, draw: () => void) {
  draw();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  document.fonts?.ready.then(() => {
    draw();
    texture.needsUpdate = true;
  });
  return texture;
}

/** Cream cube face with an embossed stage number (delivery warp tunnel). */
export function createNumberTexture(label: string, seed = 0) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const draw = () => {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#f1eff9");
    grad.addColorStop(1, "#dcd7ee");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // speckle
    let s = seed * 9301 + 49297;
    for (let i = 0; i < 900; i++) {
      s = (s * 9301 + 49297) % 233280;
      const x = (s / 233280) * size;
      s = (s * 9301 + 49297) % 233280;
      const y = (s / 233280) * size;
      ctx.fillStyle = `rgba(55,40,110,${0.04 + (i % 5) * 0.012})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }

    ctx.strokeStyle = "rgba(70,55,135,0.22)";
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, size - 32, size - 32);

    ctx.font = `600 116px ${headingFont()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(label, size / 2 - 3, size / 2 - 1);
    ctx.fillStyle = "rgba(60,45,125,0.42)";
    ctx.fillText(label, size / 2 + 3, size / 2 + 5);
    ctx.fillStyle = "#d6d0ea";
    ctx.fillText(label, size / 2, size / 2 + 2);

    ctx.font = `500 15px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(60,45,125,0.4)";
    ctx.fillText(seed % 2 ? "0110 1001_" : "1010 0111_", 28, size - 34);
  };

  return finish(canvas, draw);
}

/** Red tile with a white line icon (24×24 SVG path data). */
export function createIconTexture(path: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const draw = () => {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#8b72fa");
    grad.addColorStop(1, "#4a2fc2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, size - 44, size - 44);

    ctx.save();
    ctx.translate(size / 2 - 60, size / 2 - 60);
    ctx.scale(5, 5);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(new Path2D(path));
    ctx.restore();
  };

  return finish(canvas, draw);
}

/** Glowing white-lilac line icon on a transparent background (Home 2 glass tiles). */
export function createGlyphTexture(path: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const draw = () => {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2 - 60, size / 2 - 60);
    ctx.scale(5, 5);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // soft glow pass, then a crisp core pass
    ctx.shadowColor = "rgba(188,174,255,0.95)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#bcaeff";
    ctx.lineWidth = 2.4;
    ctx.stroke(new Path2D(path));
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    ctx.stroke(new Path2D(path));
    ctx.restore();
  };

  return finish(canvas, draw);
}

/** Simple 24×24 line icons used on the floating tiles. */
export const TILE_ICONS = [
  // target
  "M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0M18 12a6 6 0 1 1-12 0a6 6 0 1 1 12 0M14 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0",
  // arrow up-right
  "M7 17L17 7M8 7h9v9",
  // key
  "M7.5 21a4.5 4.5 0 1 1 0-9a4.5 4.5 0 1 1 0 9M10.7 13.3L20 4M16.5 7.5l3 3M13.5 10.5l2 2",
  // layers
  "M12 2L2 7l10 5l10-5zM2 17l10 5l10-5M2 12l10 5l10-5",
  // shield check
  "M12 22s8-4 8-10V5l-8-3l-8 3v7c0 6 8 10 8 10zM9 12l2 2l4-4",
  // trending up
  "M22 7l-8.5 8.5l-5-5L2 17M16 7h6v6",
];
