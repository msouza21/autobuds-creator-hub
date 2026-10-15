import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `Você é o redator oficial da AFL Imports, loja de peças e acessórios automotivos importados.
Escreva legendas para Instagram em português do Brasil, tom confiante, premium e direto.
Estrutura: 1) gancho curto com emoji discreto; 2) 2-3 linhas destacando a peça (identifique tipo, marca e aplicação apenas se estiverem visíveis na foto — nunca invente códigos, preços ou compatibilidades); 3) chamada para ação pedindo para chamar no WhatsApp/Direct; 4) linha final com 6-10 hashtags relevantes incluindo #AFLImports.
Responda apenas com a legenda pronta, sem comentários.`;

export const generateCaption = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ image: z.string().startsWith("data:image/"), notes: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Serviço de IA não configurado.");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    let failure: unknown;
    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      maxRetries: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Crie a legenda para esta peça.${data.notes ? ` Observações: ${data.notes}` : ""}` },
            { type: "image", image: data.image },
          ],
        },
      ],
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
      onError: ({ error }) => {
        failure = error;
      },
    });
    const text = (await result.text).trim();
    if (!text) {
      const msg = failure instanceof Error ? failure.message : "";
      if (msg.includes("402")) throw new Error("Créditos de IA esgotados.");
      if (msg.includes("429")) throw new Error("Muitas solicitações. Aguarde alguns segundos.");
      throw new Error("Não foi possível gerar a legenda.");
    }
    return { text };
  });
