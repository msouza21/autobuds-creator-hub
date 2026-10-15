import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageDrop({
  onFiles,
  multiple,
  title,
  hint,
  preview,
  className,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  title: string;
  hint?: string;
  preview?: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-input bg-muted/40 p-6 text-center transition-colors hover:border-primary",
        over && "border-primary bg-primary/10",
        className,
      )}
    >
      {preview ? (
        <img src={preview} alt="Foto enviada" className="max-h-56 rounded-lg object-contain" />
      ) : (
        <ImagePlus className="size-8 text-primary" />
      )}
      <span className="text-sm font-semibold">{preview ? "Trocar foto" : title}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </button>
  );
}
