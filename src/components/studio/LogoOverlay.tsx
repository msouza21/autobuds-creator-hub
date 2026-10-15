import { useRef, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { clampLogo, type LogoState } from "@/lib/canvas";

/** Preview frame with a draggable logo layer. Children render the artwork. */
export function LogoOverlay({
  aspect,
  logo,
  setLogo,
  children,
  draggable = true,
}: {
  aspect: number; // width/height
  logo: LogoState;
  setLogo: (fn: (l: LogoState) => LogoState) => void;
  children: ReactNode;
  draggable?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (!draggable || !frame.current) return;
    e.stopPropagation();
    const r = frame.current.getBoundingClientRect();
    drag.current = { dx: (e.clientX - r.left) / r.width - logo.x, dy: (e.clientY - r.top) / r.height - logo.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    const d = drag.current;
    setLogo((l) =>
      clampLogo(
        { ...l, corner: "custom", x: (e.clientX - r.left) / r.width - d.dx, y: (e.clientY - r.top) / r.height - d.dy },
        aspect,
      ),
    );
  };

  return (
    <div
      ref={frame}
      className="checker relative w-full overflow-hidden rounded-xl border select-none"
      style={{ aspectRatio: String(aspect) }}
    >
      {children}
      {logo.visible && (
        <img
          src={BRAND.logo}
          alt="Logomarca AFL Imports"
          draggable={false}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          className={`absolute drop-shadow-lg ${draggable ? "cursor-grab touch-none outline-1 outline-dashed outline-transparent hover:outline-primary active:cursor-grabbing" : ""}`}
          style={{ left: `${logo.x * 100}%`, top: `${logo.y * 100}%`, width: `${logo.w * 100}%` }}
        />
      )}
    </div>
  );
}
