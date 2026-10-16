import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ImageDrop } from "@/components/studio/ImageDrop";
import { ChipGroup, FieldLabel, PageHeader, Panel } from "@/components/studio/Panel";
import { LogoControls } from "@/components/studio/LogoControls";
import { LogoOverlay } from "@/components/studio/LogoOverlay";
import { useLogo } from "@/components/studio/useLogo";
import { BRAND } from "@/lib/brand";
import { downloadDataUrl, drawCover, drawLogo, loadImage, readFileAsDataUrl, type Rect } from "@/lib/canvas";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/colagens")({
  head: () => ({
    meta: [
      { title: "Criador de Colagens — AFL Imports Studio" },
      { name: "description", content: "Combine fotos da peça em uma publicação 1080 × 1350." },
      { property: "og:title", content: "Criador de Colagens — AFL Imports" },
      { property: "og:description", content: "Colagens com layout, enquadramento e logomarca." },
    ],
  }),
  component: Colagens,
});

const W = 1080, H = 1350, G = 12;
const LAYOUTS: Record<string, { label: string; cells: Rect[] }> = {
  dupla: { label: "2 lado a lado", cells: [{ x: 0, y: 0, w: (W - G) / 2, h: H }, { x: (W + G) / 2, y: 0, w: (W - G) / 2, h: H }] },
  empilhada: { label: "2 empilhadas", cells: [{ x: 0, y: 0, w: W, h: (H - G) / 2 }, { x: 0, y: (H + G) / 2, w: W, h: (H - G) / 2 }] },
  destaque: {
    label: "Destaque + 2",
    cells: [
      { x: 0, y: 0, w: W, h: H * 0.62 },
      { x: 0, y: H * 0.62 + G, w: (W - G) / 2, h: H * 0.38 - G },
      { x: (W + G) / 2, y: H * 0.62 + G, w: (W - G) / 2, h: H * 0.38 - G },
    ],
  },
  grade: {
    label: "Grade 4",
    cells: [0, 1, 2, 3].map((i) => ({ x: i % 2 ? (W + G) / 2 : 0, y: i > 1 ? (H + G) / 2 : 0, w: (W - G) / 2, h: (H - G) / 2 })),
  },
};

type Cell = { x: number; y: number; zoom: number };

function Colagens() {
  const [photos, setPhotos] = useState<{ src: string; img: HTMLImageElement }[]>([]);
  const [layout, setLayout] = useState("destaque");
  const [cells, setCells] = useState<Cell[]>([]);
  const [sel, setSel] = useState(0);
  const [enhance, setEnhance] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ i: number; sx: number; sy: number; c: Cell } | null>(null);
  const L = useLogo(W / H);
  const rects = LAYOUTS[layout]!.cells;

  useEffect(() => setCells(rects.map(() => ({ x: 0, y: 0, zoom: 1 }))), [layout]); // eslint-disable-line

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = BRAND.art.ink;
    ctx.fillRect(0, 0, W, H);
    ctx.filter = enhance ? "brightness(1.05) contrast(1.08) saturate(1.04)" : "none";
    rects.forEach((r, i) => {
      const p = photos[i % Math.max(photos.length, 1)];
      const c = cells[i] ?? { x: 0, y: 0, zoom: 1 };
      if (p) drawCover(ctx, p.img, r, c, c.zoom);
    });
    ctx.filter = "none";
  };

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) render(ctx);
  });

  const add = async (files: File[]) => {
    const next = await Promise.all(files.map(async (f) => { const src = await readFileAsDataUrl(f); return { src, img: await loadImage(src) }; }));
    setPhotos((p) => [...p, ...next].slice(0, 8));
  };

  const cellAt = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    return rects.findIndex((c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
  };

  const exportImg = async () => {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    render(ctx);
    await drawLogo(ctx, L.logo);
    const url = c.toDataURL("image/jpeg", 0.92);
    downloadDataUrl(url, `afl-colagem-${Date.now()}.jpg`);
    await addHistory({ kind: "colagem", title: `Colagem · ${LAYOUTS[layout]!.label}`, image: url });
    toast.success("Colagem baixada e salva no histórico.");
  };

  return (
    <>
      <PageHeader title="Criador de Colagens" subtitle="Combine diferentes fotos da peça em uma única publicação 1080 × 1350. Escolha a foto principal, o layout e arraste cada bloco para ajustar o enquadramento." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Panel>
            <ImageDrop multiple title="Enviar fotografias" hint="Arraste várias imagens ou clique · até 8 fotos" onFiles={add} />
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="group relative">
                    <img src={p.src} alt="" className={`aspect-square w-full rounded-lg object-cover ${i === 0 ? "ring-2 ring-primary" : ""}`} />
                    <button title="Definir como principal" className="absolute left-1 top-1 rounded bg-background/80 p-0.5" onClick={() => setPhotos((ps) => [ps[i]!, ...ps.filter((_, j) => j !== i)])}>
                      <Star className={`size-3 ${i === 0 ? "fill-primary text-primary" : ""}`} />
                    </button>
                    <button title="Remover" className="absolute right-1 top-1 rounded bg-background/80 p-0.5" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}>
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <FieldLabel>Layout</FieldLabel>
              <ChipGroup value={layout} onChange={setLayout} options={Object.entries(LAYOUTS).map(([value, l]) => ({ value, label: l.label }))} />
            </div>
            <div>
              <FieldLabel>Zoom do bloco {sel + 1}</FieldLabel>
              <Slider min={100} max={250} value={[Math.round((cells[sel]?.zoom ?? 1) * 100)]} onValueChange={([v]) => setCells((cs) => cs.map((c, i) => (i === sel ? { ...c, zoom: (v ?? 100) / 100 } : c)))} />
            </div>
            <label className="flex items-center justify-between text-sm">
              Melhorar fotos (exposição e contraste leves)
              <Switch checked={enhance} onCheckedChange={setEnhance} />
            </label>
            <p className="text-xs text-muted-foreground">As fotografias não são recriadas por IA. Produto, códigos e cores permanecem fiéis ao original.</p>
          </Panel>
          <LogoControls {...L} note="Camada independente aplicada acima da colagem, sempre dentro da margem segura." />
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-full max-w-[560px]">
            <LogoOverlay aspect={W / H} logo={L.logo} setLogo={L.setLogo}>
              <canvas
                ref={canvas}
                width={W}
                height={H}
                className="absolute inset-0 h-full w-full cursor-move touch-none"
                onPointerDown={(e) => {
                  const i = cellAt(e);
                  if (i < 0) return;
                  setSel(i);
                  drag.current = { i, sx: e.clientX, sy: e.clientY, c: cells[i] ?? { x: 0, y: 0, zoom: 1 } };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (!d) return;
                  const r = canvas.current!.getBoundingClientRect();
                  const k = 3 / r.width;
                  setCells((cs) => cs.map((c, i) => (i === d.i ? { ...c, x: Math.max(-1, Math.min(1, d.c.x - (e.clientX - d.sx) * k)), y: Math.max(-1, Math.min(1, d.c.y - (e.clientY - d.sy) * k)) } : c)));
                }}
                onPointerUp={() => (drag.current = null)}
              />
              {photos.length === 0 && <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">Envie fotos para montar a colagem.</div>}
            </LogoOverlay>
          </div>
          {photos.length > 0 && (
            <div className="flex justify-center">
              <Button onClick={exportImg}><Download /> Baixar colagem 1080 × 1350</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
