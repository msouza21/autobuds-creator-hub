import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/studio/Panel";
import { NAV } from "@/components/studio/AppShell";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — AFL Imports Studio" },
      { name: "description", content: "Central de ferramentas de conteúdo da AFL Imports: fotos, colagens, ofertas e legendas." },
      { property: "og:title", content: "AFL Imports Studio" },
      { property: "og:description", content: "Central de ferramentas de conteúdo da AFL Imports." },
    ],
  }),
  component: Index,
});

const DESC: Record<string, string> = {
  "/estudio": "Trate fotos e receba a versão final 1080 × 1350 com a assinatura AFL Imports.",
  "/colagens": "Combine diferentes fotos da peça em uma única publicação.",
  "/ofertas": "Anúncios premium com preço, selos e CTA aplicados pelo Studio.",
  "/legendas": "Legendas prontas no tom da marca para cada publicação.",
  "/historico": "Reveja e baixe novamente tudo que já foi produzido.",
};

function Index() {
  return (
    <>
      <PageHeader title="Início" subtitle="Central de ferramentas AFL Imports." />
      <section className="bg-hero flex flex-col items-center gap-8 rounded-2xl border p-8 md:flex-row md:p-12">
        <img src={BRAND.logo} alt="Logomarca AFL Imports" className="w-40 shrink-0" />
        <div>
          <p className="eyebrow">Software próprio AFL Imports</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Bem-vindo ao AFL Imports Studio</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Produza conteúdo com padrão visual consistente: fotografias tratadas, legendas no tom da marca e a
            logomarca oficial aplicada automaticamente.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/estudio">
              Abrir Estúdio de Imagens <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NAV.filter((n) => DESC[n.to]).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group rounded-2xl border bg-card p-6 transition-colors hover:border-primary/60">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-5 font-semibold">{label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{DESC[to]}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
              Acessar <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
