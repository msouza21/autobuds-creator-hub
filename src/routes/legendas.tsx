import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageDrop } from "@/components/studio/ImageDrop";
import { PageHeader, Panel } from "@/components/studio/Panel";
import { generateCaption } from "@/lib/caption.functions";
import { readFileAsDataUrl, shrinkImage } from "@/lib/canvas";
import { addHistory } from "@/lib/history";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/legendas")({
  head: () => ({
    meta: [
      { title: "Gerador de Legendas — AFL Imports Studio" },
      { name: "description", content: "Legendas prontas para Instagram no tom da AFL Imports." },
      { property: "og:title", content: "Gerador de Legendas — AFL Imports" },
      { property: "og:description", content: "Envie a foto da peça e receba a legenda pronta." },
    ],
  }),
  component: Legendas,
});

function Legendas() {
  const [src, setSrc] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const run = useServerFn(generateCaption);

  const go = async () => {
    if (!src) return;
    setBusy(true);
    try {
      const image = await readFileAsDataUrl(await shrinkImage(src, 1024));
      const r = await run({ data: { image, notes: notes || undefined } });
      setText(r.text);
      await addHistory({ kind: "legenda", title: "Legenda", text: r.text, image });
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível gerar a legenda.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Gerador de Legendas" subtitle="Envie a foto da peça e clique em gerar. A legenda sai pronta para copiar e colar no Instagram." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <ImageDrop title="Enviar foto da peça" hint="PNG ou JPG" preview={src} onFiles={async ([f]) => setSrc(await readFileAsDataUrl(f))} />
          <Textarea placeholder="Observações opcionais (ex.: aplicação, marca, promoção)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button variant="hero" className="w-full" disabled={!src || busy} onClick={go}>
            {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} {busy ? "Gerando…" : "Gerar legenda"}
          </Button>
        </Panel>
        <Panel>
          {text ? (
            <>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  toast.success("Legenda copiada.");
                }}
              >
                <Copy /> Copiar legenda
              </Button>
            </>
          ) : (
            <div className="grid min-h-64 place-items-center text-center text-sm text-muted-foreground">
              <div>
                <img src={BRAND.logo} alt="" className="mx-auto mb-4 h-12 opacity-40" />A legenda gerada aparece aqui.
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
