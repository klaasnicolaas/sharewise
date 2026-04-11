"use client";

import {
  Check,
  ClipboardList,
  Copy,
  MessageSquare,
  PartyPopper,
  TriangleAlert,
} from "lucide-react";
import { euro } from "@/lib/calculations/money";
import { buildGroupSummary, buildTikkieSummary } from "@/lib/calculations/selectors";
import { useI18n } from "@/components/i18n-provider";
import type { DashboardActions, DashboardState } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/dashboard/section-header";

/* ─── Household card colors (matching participants step style) ─ */
const CARD_ACCENTS = [
  { border: "border-l-emerald-400", dot: "bg-emerald-500" },
  { border: "border-l-blue-400", dot: "bg-blue-500" },
  { border: "border-l-amber-400", dot: "bg-amber-500" },
  { border: "border-l-violet-400", dot: "bg-violet-500" },
  { border: "border-l-rose-400", dot: "bg-rose-500" },
  { border: "border-l-cyan-400", dot: "bg-cyan-500" },
  { border: "border-l-orange-400", dot: "bg-orange-500" },
  { border: "border-l-fuchsia-400", dot: "bg-fuchsia-500" },
];

export function PaymentsStep({
  state,
  actions,
}: {
  state: DashboardState;
  actions: DashboardActions;
}) {
  const { result, copyState } = state;
  const { handleCopy } = actions;
  const { locale, copy } = useI18n();
  const hasShareableResult =
    result.householdTotals.length > 0 && !result.includedCostsTotal.isZero();

  const summaryText = buildGroupSummary(result, locale);
  const paymentSummaryText = buildTikkieSummary(result, locale);

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <SectionHeader title={copy.payments.title} subtitle={copy.payments.subtitle} />

      {/* Hero celebration banner */}
      {result.warnings.length === 0 && hasShareableResult && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-primary/3 to-transparent p-6 sm:p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <PartyPopper className="size-7 text-primary" />
          </div>
          <p className="text-lg font-bold tracking-tight">{copy.payments.heroTitle}</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            {copy.payments.heroDescription}
          </p>
        </div>
      )}

      {/* Warnings (shown at top if present) */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w) => (
            <Alert
              key={`${w.code}-${w.message}`}
              variant={w.level === "error" ? "destructive" : "default"}
            >
              <TriangleAlert className="size-4" />
              <AlertTitle>
                {w.level === "error" ? copy.common.error : copy.common.warning}
              </AlertTitle>
              <AlertDescription>{w.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Household cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {result.householdTotals.map((h, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
          const rowText = `${h.householdName}: ${euro(h.roundedDisplayTotal, locale)}`;
          const copyKey = `hh-${h.householdId}`;
          const isCopied = copyState === copyKey;

          return (
            <div
              key={h.householdId}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border border-border/50 border-l-4 bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-border/80",
                accent.border,
              )}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={cn("size-2 rounded-full shrink-0", accent.dot)} />
                  <p className="font-semibold truncate">{h.householdName}</p>
                </div>

                <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight">
                  {euro(h.roundedDisplayTotal, locale)}
                </p>

                <Separator className="my-4 opacity-40" />

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{copy.common.participants}</span>
                    <span className="tabular-nums font-medium text-foreground/70">
                      {euro(h.participantSubtotal, locale)}
                    </span>
                  </div>
                  {!h.directCostsSubtotal.isZero() && (
                    <div className="flex justify-between">
                      <span>{copy.common.directCosts}</span>
                      <span className="tabular-nums font-medium text-foreground/70">
                        {euro(h.directCostsSubtotal, locale)}
                      </span>
                    </div>
                  )}
                  {!h.roundingAdjustment.isZero() && (
                    <div className="flex justify-between">
                      <span>{copy.common.rounding}</span>
                      <span className="tabular-nums font-medium text-foreground/70">
                        {euro(h.roundingAdjustment, locale)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant={isCopied ? "default" : "outline"}
                size="default"
                className={cn(
                  "mt-5 w-full justify-center gap-2 transition-all duration-200",
                  isCopied && "bg-primary text-primary-foreground",
                )}
                onClick={() => handleCopy(copyKey, rowText)}
              >
                {isCopied ? (
                  <Check className="size-3.5 mr-1.5" />
                ) : (
                  <Copy className="size-3.5 mr-1.5" />
                )}
                {isCopied ? copy.common.copied : copy.payments.copyAmount}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Copy actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/50">
              <ClipboardList className="size-4.5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{copy.payments.shareTitle}</CardTitle>
              <CardDescription>{copy.payments.shareDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-10 flex-1 justify-center gap-2"
            onClick={() => handleCopy("group", summaryText)}
          >
            {copyState === "group" ? (
              <Check className="size-4 text-primary" />
            ) : (
              <MessageSquare className="size-4" />
            )}
            <span>{copyState === "group" ? copy.common.copied : copy.payments.groupSummary}</span>
          </Button>
          <Button
            type="button"
            size="default"
            className="h-10 flex-1 justify-center gap-2 shadow-sm"
            onClick={() => handleCopy("payments", paymentSummaryText)}
          >
            {copyState === "payments" ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>
              {copyState === "payments" ? copy.common.copied : copy.payments.copyOverview}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
