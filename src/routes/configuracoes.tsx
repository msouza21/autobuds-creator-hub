import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChipGroup, FieldLabel, PageHeader, Panel } from "@/components/studio/Panel";
import { BRAND, DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/brand";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — AFL Imports Studio" },
      { name: "description", content: "Identidade AFL Imports e preferências de assinatura." },
      { property: "og:title", content: "Configurações — AFL Imports" },
      { property: "og:description", content: "Logomarca oficial e preferências de assinatura." },
    ],
  }),
  component: Config,
});

function Config() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => setS(loadSettings()), []);
  const update = (p: Partial<Settings>) => {
    const n = { ...s, ...p };
    setS(n);
    saveSettings(n);
  };
  return (
    <>
      <PageHeader title="Configurações" subtitle="Identidade AFL Imports e preferências de assinatura." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel label="Identidade" title="Logomarca oficial">
          <div className="checker grid place-items-center rounded-xl p-8">
            <img src={BRAND.logo} alt="Logomarca AFL Imports" className="h-28 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground">Versão para fundo escuro, usada em todas as criações.</p>
          <Button asChild variant="outline" size="sm">
            <a href={BRAND.logo} download="afl-imports-logo.png">
              <Download /> Baixar logomarca
            </a>
          </Button>
        </Panel>
        <Panel label="Assinatura" title="Assinatura nas fotografias">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Adicionar logomarca automaticamente</span>
            <Switch checked={s.autoLogo} onCheckedChange={(v) => update({ autoLogo: v })} />
          </label>
          <div>
            <FieldLabel>Posição padrão</FieldLabel>
            <ChipGroup
              value={s.defaultCorner}
              onChange={(v) => update({ defaultCorner: v })}
              options={[
                { value: "auto", label: "Automática" },
                { value: "tl", label: "Superior esquerdo" },
                { value: "tr", label: "Superior direito" },
                { value: "bl", label: "Inferior esquerdo" },
                { value: "br", label: "Inferior direito" },
              ]}
            />
            <p className="mt-2 text-xs text-muted-foreground">Em "Automática" o Studio escolhe o canto mais limpo da imagem.</p>
          </div>
          <div>
            <FieldLabel>Tamanho padrão</FieldLabel>
            <ChipGroup
              value={s.defaultSize}
              onChange={(v) => update({ defaultSize: v })}
              options={[
                { value: "sm", label: "Pequena" },
                { value: "md", label: "Média" },
              ]}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}
