"use client";

import { Download, Euro, RefreshCw, Upload } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  isPending,
  onReset,
  onExport,
  onImportClick,
}: {
  isPending: boolean;
  onReset: () => void;
  onExport: () => void;
  onImportClick: () => void;
}) {
  const { locale, setLocale, copy } = useI18n();

  return (
    <header className="border-b border-border/40 bg-card/80 backdrop-blur-lg sticky top-0 z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/15">
            <Euro className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-tight">Sharewise</span>
            <span className="hidden text-xs leading-tight text-muted-foreground sm:block">
              {copy.app.tagline}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden items-center rounded-full border border-border/75 bg-muted/35 p-0.5 shadow-xs sm:flex">
            {(["nl", "en"] as const).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setLocale(language)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                  locale === language
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/70"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                {copy.language[language]}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground sm:hidden"
            onClick={onReset}
          >
            <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
          </Button>
          <div className="hidden sm:flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onReset}
            >
              <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
              {copy.header.reset}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onExport}
            >
              <Download className="size-3.5" />
              {copy.header.export}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onImportClick}
            >
              <Upload className="size-3.5" />
              {copy.header.import}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
