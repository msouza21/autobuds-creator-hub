import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Grid2x2, History, Home, Image, Menu, Settings, Tag, Type } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/estudio", label: "Estúdio de Imagens", icon: Image },
  { to: "/colagens", label: "Criador de Colagens", icon: Grid2x2 },
  { to: "/ofertas", label: "Gerador de Ofertas", icon: Tag },
  { to: "/legendas", label: "Gerador de Legendas", icon: Type },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === path)?.label ?? "";

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/" className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4" onClick={() => setOpen(false)}>
          <img src={BRAND.logo} alt="Logomarca AFL Imports" className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-[0.18em]">AFL IMPORTS</p>
            <p className="text-[10px] tracking-[0.35em] text-muted-foreground">STUDIO</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          <p className="eyebrow px-2 pb-2 pt-3">Ferramentas</p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                path === to && "bg-sidebar-accent text-foreground",
              )}
            >
              <Icon className={cn("size-4", path === to && "text-primary")} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="eyebrow">Software próprio AFL Imports</p>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-5 backdrop-blur">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <span className="eyebrow text-foreground">{current}</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
        <footer className="px-5 pb-6 text-right">
          <span className="eyebrow">Uso exclusivo da equipe AFL Imports</span>
        </footer>
      </div>
    </div>
  );
}
