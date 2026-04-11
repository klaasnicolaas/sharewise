"use client";

import { Euro, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function DashboardFooter() {
  const { copy } = useI18n();

  return (
    <footer className="mt-8 border-t border-border/40 bg-muted/20 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/8">
            <Euro className="size-3.5 text-primary/80" />
          </div>
          <div>
            <span className="font-semibold text-foreground">Sharewise</span>
            <span className="mx-1.5 text-muted-foreground/60">&middot;</span>
            <span>{copy.app.tagline}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          <span>{copy.app.localOnly}</span>
        </div>
      </div>
    </footer>
  );
}
