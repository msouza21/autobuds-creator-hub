import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/studio/Panel";
import { downloadDataUrl } from "@/lib/canvas";
import { listHistory, removeHistory, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — AFL Imports Studio" },
      { name: "description", content: "Tudo que já foi produzido no AFL Imports Studio." },
      { property: "og:title", content: "Histórico — AFL Imports" },
      { property: "og:description", content: "Reveja e baixe novamente suas criações." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const refresh = () => listHistory().then(setItems);
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <PageHeader title="Histórico" subtitle="Reveja e baixe novamente tudo que já foi produzido neste navegador." />
      {items && items.length === 0 && <p className="text-sm text-muted-foreground">Nada produzido ainda.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((i) => (
          <article key={i.id} className="overflow-hidden rounded-2xl border bg-card">
            {i.image && <img src={i.image} alt={i.title} className="aspect-[4/5] w-full object-cover" loading="lazy" />}
            <div className="space-y-3 p-4">
              <div>
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              {i.text && <p className="line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{i.text}</p>}
              <div className="flex gap-2">
                {i.kind !== "legenda" && i.image && (
                  <Button size="sm" variant="outline" onClick={() => downloadDataUrl(i.image!, `afl-${i.kind}-${i.createdAt}.jpg`)}>
                    <Download /> Baixar
                  </Button>
                )}
                {i.text && (
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(i.text!); toast.success("Copiado."); }}>
                    <Copy /> Copiar
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="ml-auto" aria-label="Excluir" onClick={async () => { await removeHistory(i.id); refresh(); }}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
