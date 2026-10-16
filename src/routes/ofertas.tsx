import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageDrop } from "@/components/studio/ImageDrop";
import { ChipGroup, FieldLabel, PageHeader, Panel } from "@/components/studio/Panel";
import { LogoControls } from "@/components/studio/LogoControls";
import { LogoOverlay } from "@/components/studio/LogoOverlay";
import { useLogo } from "@/components/studio/useLogo";
import { aiEdit, PRESERVE } from "@/lib/ai-edit";
import { BRAND } from "@/lib/brand";
import { downloadDataUrl, drawCover, drawLogo, loadImage, readFileAsDataUrl, roundRect } from "@/lib/canvas";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Gerador de Ofertas — AFL Imports Studio" },
      { name: "description", content: "Anúncios premium com preço, selos e CTA aplicados pelo Studio." },
      { property: "og:title", content: "Gerador de Ofertas — AFL Imports" },
      { property: "og:description", content: "Crie anúncios de oferta 1080 × 1350 com a marca AFL Imports." },
    ],
  }),
  component: Ofertas,
});

const W = 1080, H = 1350;
const STYLES = {
  premium: { label: "Premium", hint: "Sofisticado e elegante.", prompt: "luxurious dark graphite studio with soft blue rim light, elegant reflections" },
  performance: { label: "Performance", hint: "Esportivo e agressivo.", prompt: "aggressive motorsport scene, dramatic blue light streaks, smoke and carbon fiber textures" },
  clean: { label: "Clean", hint: "Menos elementos, foco na foto.", prompt: "minimal seamless light grey studio, soft shadow" },
  oferta: { label: "Oferta", hint: "Preço e desconto em destaque.", prompt: "bold dark blue backdrop with energetic light burst behind the product" },
};
const BADGES = ["Produto Original", "Entrega Rápida", "Garantia de Qualidade"];
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", ".")) || 0;

function Ofertas() {
  const [src, setSrc] = useState<string | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [oldP, setOldP] = useState("3.800,00");
  const [newP, setNewP] = useState("3.300,00");
  const [style, setStyle] = useState<keyof typeof STYLES>("premium");
  const [show, setShow] = useState({ name: true, hoje: true, old: true, promo: true, save: true, whats: true });
  const [badges, setBadges] = useState<string[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const L = useLogo(W / H);
  const o = num(oldP), p = num(newP);
  const save = Math.max(0, o - p), pct = o ? Math.round((save / o) * 100) : 0;

  const render = async (ctx: CanvasRenderingContext2D) => {
    await document.fonts.ready;
    const A = BRAND.art;
    ctx.fillStyle = A.ink;
    ctx.fillRect(0, 0, W, H);
    if (bg) drawCover(ctx, await loadImage(bg), { x: 0, y: 0, w: W, h: H });
    const g = ctx.createLinearGradient(0, H * 0.5, 0, H);
    g.addColorStop(0, "rgba(5,7,12,0)");
    g.addColorStop(1, "rgba(5,7,12,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
    const big = style === "oferta" ? 1.2 : 1;
    let y = H - 70;
    if (show.whats) {
      roundRect(ctx, 70, y - 90, 460, 90, 45);
      ctx.fillStyle = A.whatsapp; ctx.fill();
      ctx.fillStyle = A.white; ctx.font = "700 34px Sora"; ctx.textBaseline = "middle";
      ctx.fillText("Chame no WhatsApp", 110, y - 45);
      y -= 120;
    }
    ctx.textBaseline = "alphabetic";
    if (show.save && save > 0) {
      ctx.fillStyle = A.blueGlow; ctx.font = "700 36px Sora";
      ctx.fillText(`ECONOMIZE ${brl(save)} · ${pct}% OFF`, 70, y); y -= 60;
    }
    if (show.promo && p) {
      ctx.fillStyle = A.white; ctx.font = `800 ${Math.round(110 * big)}px Sora`;
      ctx.fillText(brl(p), 70, y); y -= Math.round(120 * big);
    }
    if (show.old && o) {
      ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "500 40px Sora";
      const t = `De ${brl(o)}`; ctx.fillText(t, 70, y);
      const tw = ctx.measureText(t).width;
      ctx.fillRect(70, y - 14, tw, 3); y -= 64;
    }
    if (show.name && name) {
      ctx.fillStyle = A.white; ctx.font = "700 52px Sora"; ctx.fillText(name.toUpperCase(), 70, y);
    }
    let bx = 70; const by = 70;
    const pill = (t: string, fill: string) => {
      ctx.font = "700 26px Sora";
      const w = ctx.measureText(t).width + 48;
      roundRect(ctx, bx, by, w, 54, 27); ctx.fillStyle = fill; ctx.fill();
      ctx.fillStyle = A.white; ctx.textBaseline = "middle"; ctx.fillText(t, bx + 24, by + 28); ctx.textBaseline = "alphabetic";
      bx += w + 14;
    };
    if (show.hoje) pill("SÓ HOJE", A.blue);
    badges.forEach((b) => pill(b.toUpperCase(), "rgba(255,255,255,0.14)"));
  };

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) render(ctx);
  });

  const generate = async () => {
    if (!src) return;
    setBusy(true); setFinal(false);
    try {
      await aiEdit(src, `Premium advertising backdrop for an automotive parts offer, 4:5 vertical. Scene: ${STYLES[style].prompt}. Place the product in the upper-middle area, leaving the top 10% and the bottom 40% calm and darker for text overlays added later. ${PRESERVE}`, "1024x1280", (u, f) => { setBg(u); setFinal(f); });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const exportImg = async () => {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    await render(ctx); await drawLogo(ctx, L.logo);
    const url = c.toDataURL("image/jpeg", 0.92);
    downloadDataUrl(url, `afl-oferta-${Date.now()}.jpg`);
    await addHistory({ kind: "oferta", title: `Oferta · ${name || "Produto"}`, image: url });
    toast.success("Anúncio baixado e salvo no histórico.");
  };

  const toggle = (k: keyof typeof show, label: string) => (
    <label key={k} className="flex items-center justify-between text-sm">{label}<Switch checked={show[k]} onCheckedChange={(v) => setShow((s) => ({ ...s, [k]: v }))} /></label>
  );

  return (
    <>
      <PageHeader title="Gerador de Ofertas" subtitle="Envie a foto da peça, informe a oferta e gere um anúncio premium 1080 × 1350. Preço, selos e CTA são aplicados pelo próprio Studio — nunca desenhados pela IA." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Panel label="Foto do produto">
            <ImageDrop title="Enviar foto da peça" hint="A peça é preservada — a IA cria apenas o cenário." preview={src} onFiles={async ([f]) => setSrc(await readFileAsDataUrl(f))} />
          </Panel>
          <Panel label="Informações da oferta">
            <div><FieldLabel>Nome do produto (opcional)</FieldLabel><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><FieldLabel>Preço original</FieldLabel><Input value={oldP} onChange={(e) => setOldP(e.target.value)} /></div>
              <div><FieldLabel>Preço promocional</FieldLabel><Input value={newP} onChange={(e) => setNewP(e.target.value)} /></div>
            </div>
            <p className="text-xs text-muted-foreground">Economia: {brl(save)} · Desconto: {pct}% OFF</p>
          </Panel>
          <Panel label="Elementos do anúncio">
            {toggle("name", "Nome do produto")}{toggle("hoje", 'Selo "SÓ HOJE"')}{toggle("old", "Mostrar preço antigo")}
            {toggle("promo", "Mostrar preço promocional")}{toggle("save", "Mostrar economia / desconto")}{toggle("whats", "Botão WhatsApp")}
          </Panel>
          <Panel label="Selos">
            {BADGES.map((b) => (
              <label key={b} className="flex items-center justify-between text-sm">{b}<Switch checked={badges.includes(b)} onCheckedChange={(v) => setBadges((bs) => (v ? [...bs, b] : bs.filter((x) => x !== b)))} /></label>
            ))}
            <p className="text-xs text-muted-foreground">Nenhum selo é ativado automaticamente. Use apenas os que forem verdadeiros.</p>
          </Panel>
          <Panel label="Estilo">
            <ChipGroup value={style} onChange={setStyle} options={Object.entries(STYLES).map(([value, s]) => ({ value: value as keyof typeof STYLES, label: s.label, hint: s.hint }))} />
            <p className="text-xs text-muted-foreground">{STYLES[style].hint} O estilo altera somente o cenário. O produto nunca é modificado.</p>
            <Button variant="hero" className="w-full" disabled={!src || busy} onClick={generate}>
              {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} {busy ? "Gerando cenário…" : "Gerar anúncio"}
            </Button>
          </Panel>
          <LogoControls {...L} note="Arraste a marca sobre a arte para posicioná-la livremente — a margem segura é sempre respeitada." />
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-full max-w-[560px]">
            <LogoOverlay aspect={W / H} logo={L.logo} setLogo={L.setLogo}>
              <canvas ref={canvas} width={W} height={H} className={`absolute inset-0 h-full w-full transition-[filter] duration-500 ${bg && !final ? "blur-xl" : "blur-0"}`} />
            </LogoOverlay>
          </div>
          {bg && final && <div className="flex justify-center"><Button onClick={exportImg}><Download /> Baixar anúncio 1080 × 1350</Button></div>}
        </div>
      </div>
    </>
  );
}
