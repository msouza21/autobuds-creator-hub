import { useCallback, useEffect, useState } from "react";
import { loadSettings, type Corner } from "@/lib/brand";
import { LOGO_SIZES, clampLogo, placeCorner, type LogoState } from "@/lib/canvas";

export function useLogo(canvasAspect: number) {
  const [logo, setLogo] = useState<LogoState>(() => {
    const w = LOGO_SIZES.sm;
    return { visible: true, corner: "tr", sizeKey: "sm", w, ...placeCorner("tr", w, canvasAspect) };
  });

  // apply saved defaults after hydration
  useEffect(() => {
    const s = loadSettings();
    const corner: Corner = s.defaultCorner === "auto" ? "tr" : s.defaultCorner;
    const w = LOGO_SIZES[s.defaultSize];
    setLogo({ visible: s.autoLogo, corner, sizeKey: s.defaultSize, w, ...placeCorner(corner, w, canvasAspect) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep inside safe area when aspect changes
  useEffect(() => {
    setLogo((l) =>
      l.corner === "custom" ? clampLogo(l, canvasAspect) : { ...l, ...placeCorner(l.corner, l.w, canvasAspect) },
    );
  }, [canvasAspect]);

  const setCorner = useCallback(
    (corner: Corner) => setLogo((l) => ({ ...l, corner, ...placeCorner(corner, l.w, canvasAspect) })),
    [canvasAspect],
  );

  const setSize = useCallback(
    (sizeKey: "sm" | "md" | "custom", custom?: number) =>
      setLogo((l) => {
        const w = sizeKey === "custom" ? (custom ?? l.w) : LOGO_SIZES[sizeKey];
        const next = { ...l, sizeKey, w };
        return l.corner === "custom" ? clampLogo(next, canvasAspect) : { ...next, ...placeCorner(l.corner, w, canvasAspect) };
      }),
    [canvasAspect],
  );

  const autoCorner = useCallback(
    async (src: string) => {
      const s = loadSettings();
      if (s.defaultCorner !== "auto") return;
      const { cleanestCorner } = await import("@/lib/canvas");
      setCorner(await cleanestCorner(src));
    },
    [setCorner],
  );

  const reset = useCallback(() => {
    const s = loadSettings();
    const corner: Corner = s.defaultCorner === "auto" ? "tr" : s.defaultCorner;
    const w = LOGO_SIZES[s.defaultSize];
    setLogo({ visible: true, corner, sizeKey: s.defaultSize, w, ...placeCorner(corner, w, canvasAspect) });
  }, [canvasAspect]);

  return { logo, setLogo, setCorner, setSize, reset, autoCorner };
}
