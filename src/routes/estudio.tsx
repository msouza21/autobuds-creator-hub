import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageDrop } from "@/components/studio/ImageDrop";
import { ChipGroup, FieldLabel, PageHeader, Panel } from "@/components/studio/Panel";
import { LogoControls } from "@/components/studio/LogoControls";
import { LogoOverlay } from "@/components/studio/LogoOverlay";
import { useLogo } from "@/components/studio/useLogo";
import { aiEdit, PRESERVE } from "@/lib/ai-edit";
import { drawCover, drawLogo, loadImage, readFileAsDataUrl, downloadDataUrl } from "@/lib/canvas";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/estudio")({
  head: () => ({
    meta: [
      { title: "Estúdio de Imagens — AFL Imports Studio" },
      { name: "description", content: "Fotografia comercial automotiva premium com a assinatura AFL Imports." },
      { property: "og:title", content: "Estúdio de Imagens — AFL Imports" },
      { property: "og:description", content: "Trate fotos de peças e receba Feed ou Story com a logomarca." },
    ],
  }),
  component: Estudio,
});

const FORMATS = {
  feed: { label: "Feed 1080 × 1350", w: 1080, h: 1350, ai: "1024x1280" },
  story: { label: "Story 1080 × 1920", w: 1080, h: 1920, ai: "1008x1792" },
};

const STYLES = {
  premium: "dark premium automotive studio, deep graphite backdrop with subtle cool blue rim light and soft reflections on a glossy floor",
  showroom: "bright modern import showroom, clean light grey surfaces, soft diffused daylight",
  urbano: "moody urban night scene, wet asphalt with blue and white bokeh city lights",
  clean: "seamless pure white studio sweep, soft even shadows, catalog e-commerce look",
};

function Estudio() {
  const [format, setFormat] = useState<keyof typeof FORMATS>("feed");
  const [style, setStyle] = useState<keyof typeof STYLES>("premium");
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const F = FORMATS[format];
  const aspect = F.w / F.h;
  const L = useLogo(aspect);

  const generate = async () => {
    if (!source) return;
    setBusy(true);
    setResult(null);
    setFinal(false);
    try {
      await aiEdit(
        source,
        `Professional commercial photograph of this automotive product for an Instagram ${format === "feed" ? "4:5 feed post" : "9:16 story"}. Setting: ${STYLES[style]}. Product centered, sharp, perfectly lit, generous breathing room around it. ${PRESERVE}`,
        F.ai,
        (url, isFinal) => {
          setResult(url);
          setFinal(isFinal);
          if (isFinal) L.autoCorner(url);
        },
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const exportImage = async () => {
    if (!result) return;
    const c = document.createElement("canvas");
    c.width = F.w;
    c.height = F.h;
    const ctx = c.getContext("2d")!;
    drawCover(ctx, await loadImage(result), { x: 0, y: 0, w: F.w, h: F.h });
    await drawLogo(ctx, L.logo);
    const url = c.toDataURL("image/jpeg", 0.92);
    downloadDataUrl(url, `afl-${format}-${Date.now()}.jpg`);
    await addHistory({ kind: "estudio", title: `Estúdio · ${F.label}`, image: url });
    toast.success("Imagem baixada e salva no histórico.");
  };

  return (
    <>
      <PageHeader title="Estúdio de Imagens" subtitle="Fotografia comercial automotiva premium. Feed e Story com assinatura oficial AFL Imports." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Panel>
            <ImageDrop
              title="Enviar fotografia"
              hint="PNG ou JPG · saída Feed 1080 × 1350 ou Story 1080 × 1920"
              preview={source}
              onFiles={async ([f]) => {
                setSource(await readFileAsDataUrl(f));
                setResult(null);
              }}
            />
            <div>
              <FieldLabel>Formato</FieldLabel>
              <ChipGroup
                value={format}
                onChange={setFormat}
                options={[
                  { value: "feed", label: "Feed" },
                  { value: "story", label: "Story" },
                ]}
              />
            </div>
            <div>
              <FieldLabel>Estilo fotográfico</FieldLabel>
              <ChipGroup
                value={style}
                onChange={setStyle}
                options={[
                  { value: "premium", label: "Premium automotivo" },
                  { value: "showroom", label: "Showroom" },
                  { value: "urbano", label: "Urbano noturno" },
                  { value: "clean", label: "Catálogo clean" },
                ]}
              />
            </div>
            <Button variant="hero" className="w-full" disabled={!source || busy} onClick={generate}>
              {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {busy ? "Gerando fotografia…" : "Gerar fotografia"}
            </Button>
          </Panel>
          <LogoControls
            {...L}
            note="Após gerar a fotografia, mova e redimensione a logomarca livremente. A exportação usa exatamente a posição, a escala e a visibilidade mostradas no preview."
          />
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-full" style={{ maxWidth: format === "feed" ? 560 : 420 }}>
            <LogoOverlay aspect={aspect} logo={L.logo} setLogo={L.setLogo} draggable={!!result}>
              {result ? (
                <img
                  src={result}
                  alt="Fotografia gerada"
                  className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ${final ? "blur-0" : "blur-2xl"}`}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-muted-foreground">
                  Gere a fotografia para arrastar a logomarca sobre a imagem.
                </div>
              )}
            </LogoOverlay>
          </div>
          {result && final && (
            <div className="flex justify-center">
              <Button onClick={exportImage}>
                <Download /> Baixar {F.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
