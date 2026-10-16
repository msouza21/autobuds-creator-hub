import { BRAND, type Corner } from "./brand";

export type LogoState = {
  visible: boolean;
  corner: Corner | "custom";
  sizeKey: "sm" | "md" | "custom";
  x: number; // left, fraction of width
  y: number; // top, fraction of height
  w: number; // width, fraction of canvas width
};

export const LOGO_SIZES = { sm: 0.16, md: 0.24 } as const;
export const SAFE = 0.045;

export function logoHeightFrac(w: number, canvasAspect: number) {
  // canvasAspect = width/height
  return (w / BRAND.logoAspect) * canvasAspect;
}

export function placeCorner(corner: Corner, w: number, canvasAspect: number) {
  const h = logoHeightFrac(w, canvasAspect);
  const safeY = SAFE * canvasAspect;
  return {
    x: corner.endsWith("l") ? SAFE : 1 - SAFE - w,
    y: corner.startsWith("t") ? safeY : 1 - safeY - h,
  };
}

export function clampLogo(s: LogoState, canvasAspect: number): LogoState {
  const h = logoHeightFrac(s.w, canvasAspect);
  const safeY = SAFE * canvasAspect;
  return {
    ...s,
    x: Math.min(Math.max(s.x, SAFE), 1 - SAFE - s.w),
    y: Math.min(Math.max(s.y, safeY), 1 - safeY - h),
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/** Downscale an upload so AI requests stay small. */
export async function shrinkImage(src: string, max = 1600, type = "image/jpeg"): Promise<Blob> {
  const img = await loadImage(src);
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b!), type, 0.9));
}

export type Rect = { x: number; y: number; w: number; h: number };

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  r: Rect,
  offset = { x: 0, y: 0 },
  zoom = 1,
) {
  const scale = Math.max(r.w / img.width, r.h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const ox = (dw - r.w) / 2;
  const oy = (dh - r.h) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.drawImage(img, r.x - ox + offset.x * ox, r.y - oy + offset.y * oy, dw, dh);
  ctx.restore();
}

export async function drawLogo(ctx: CanvasRenderingContext2D, logo: LogoState) {
  if (!logo.visible) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const img = await loadImage(BRAND.logo);
  const w = logo.w * W;
  const h = w / BRAND.logoAspect;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 18;
  ctx.drawImage(img, logo.x * W, logo.y * H, w, h);
  ctx.restore();
}

/** Picks the corner with the lowest visual noise. */
export async function cleanestCorner(src: string): Promise<Corner> {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = 80;
  c.height = 100;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 80, 100);
  const corners: Corner[] = ["tl", "tr", "bl", "br"];
  let best: Corner = "tr";
  let bestScore = Infinity;
  for (const k of corners) {
    const x = k.endsWith("l") ? 0 : 56;
    const y = k.startsWith("t") ? 0 : 76;
    const d = ctx.getImageData(x, y, 24, 24).data;
    let sum = 0;
    let sq = 0;
    const n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.3 * d[i]! + 0.59 * d[i + 1]! + 0.11 * d[i + 2]!;
      sum += l;
      sq += l * l;
    }
    const v = sq / n - (sum / n) ** 2;
    if (v < bestScore) {
      bestScore = v;
      best = k;
    }
  }
  return best;
}

export function downloadDataUrl(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
