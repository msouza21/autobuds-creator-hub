import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BRAND, type Corner } from "@/lib/brand";
import type { LogoState } from "@/lib/canvas";
import { ChipGroup, FieldLabel, Panel } from "./Panel";

const CORNERS: { value: Corner; label: string }[] = [
  { value: "tl", label: "Superior esquerdo" },
  { value: "tr", label: "Superior direito" },
  { value: "bl", label: "Inferior esquerdo" },
  { value: "br", label: "Inferior direito" },
];

export function LogoControls({
  logo,
  setLogo,
  setCorner,
  setSize,
  reset,
  note,
}: {
  logo: LogoState;
  setLogo: (fn: (l: LogoState) => LogoState) => void;
  setCorner: (c: Corner) => void;
  setSize: (k: "sm" | "md" | "custom", w?: number) => void;
  reset: () => void;
  note: string;
}) {
  return (
    <Panel label="Assinatura" title="Logomarca AFL Imports">
      <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
        <img src={BRAND.logo} alt="Logomarca AFL Imports" className="h-10 w-auto" />
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => setLogo((l) => ({ ...l, visible: !l.visible }))}
        >
          {logo.visible ? <EyeOff /> : <Eye />}
          {logo.visible ? "Remover logomarca" : "Adicionar logomarca"}
        </Button>
      </div>
      <div>
        <FieldLabel>Posição</FieldLabel>
        <ChipGroup
          value={logo.corner as Corner}
          options={[...CORNERS, { value: "custom" as Corner, label: "Personalizada" }]}
          onChange={(c) => (c === ("custom" as Corner) ? setLogo((l) => ({ ...l, corner: "custom" })) : setCorner(c))}
        />
      </div>
      <div>
        <FieldLabel>Tamanho</FieldLabel>
        <ChipGroup
          value={logo.sizeKey}
          options={[
            { value: "sm", label: "Pequena" },
            { value: "md", label: "Média" },
            { value: "custom", label: "Personalizado" },
          ]}
          onChange={(k) => setSize(k)}
        />
        {logo.sizeKey === "custom" && (
          <Slider
            className="mt-4"
            min={8}
            max={40}
            step={1}
            value={[Math.round(logo.w * 100)]}
            onValueChange={([v]) => setSize("custom", (v ?? 16) / 100)}
          />
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={reset}>
        <RotateCcw /> Redefinir logomarca
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
    </Panel>
  );
}
