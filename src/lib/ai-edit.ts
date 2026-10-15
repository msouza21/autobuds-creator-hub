import { shrinkImage } from "./canvas";
import { streamImage } from "./stream-image";

export async function aiEdit(
  src: string,
  prompt: string,
  size: string,
  onFrame: (url: string, final: boolean) => void,
) {
  const blob = await shrinkImage(src, 1536);
  const form = new FormData();
  form.append("image", new File([blob], "foto.jpg", { type: "image/jpeg" }));
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", "medium");
  try {
    await streamImage("/api/edit-image", form, onFrame);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes(" 402")) throw new Error("Créditos de IA esgotados. Adicione créditos para continuar.");
    if (msg.includes(" 429")) throw new Error("Muitas solicitações. Aguarde alguns segundos e tente de novo.");
    throw new Error("Não foi possível gerar a imagem. Tente novamente.");
  }
}

export const PRESERVE =
  "Preserve the product EXACTLY as in the photo: same shape, proportions, colors, materials, labels, part numbers, packaging and branding. Do not redraw, invent or alter any text on the product. Do not add any new text, logos, watermarks, prices or badges anywhere in the image.";
