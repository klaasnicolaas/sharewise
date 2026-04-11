"use client";

import { useState } from "react";
import { ArrowRightLeft, Check, Copy, Home, Moon, Sigma, TriangleAlert, Users } from "lucide-react";
import { euro, ZERO } from "@/lib/calculations/money";
import { buildHouseholdBreakdown, buildProjectExplanation } from "@/lib/calculations/selectors";
import { useI18n } from "@/components/i18n-provider";
import type { DashboardActions, DashboardState } from "@/lib/dashboard-types";
import { getDistributionLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionHeader } from "@/components/dashboard/section-header";

/* ─── Rate card ──────────────────────────────────────────────── */
function RateCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  rate,
  total,
  totalLabel,
  divisor,
  divisorLabel,
}: {
  icon: typeof Moon;
  iconColor: string;
  iconBg: string;
  label: string;
  rate: string;
  total: string;
  totalLabel: string;
  divisor: string;
  divisorLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex size-9 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("size-4.5", iconColor)} />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">
            {divisor} {divisorLabel}
          </p>
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{rate}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {totalLabel}: <span className="tabular-nums font-medium text-foreground">{total}</span>
      </p>
    </div>
  );
}

/* ─── Household accent colors ────────────────────────────────── */
const HH_ACCENTS = [
  {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  { border: "border-l-blue-400", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  { border: "border-l-amber-400", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  {
    border: "border-l-violet-400",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  { border: "border-l-rose-400", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  { border: "border-l-cyan-400", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  {
    border: "border-l-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  {
    border: "border-l-fuchsia-400",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
];

function BreakdownSummaryRow({
  label,
  value,
  tooltipLabel,
  tooltipDescription,
  tooltipItems,
}: {
  label: string;
  value: string;
  tooltipLabel?: string;
  tooltipDescription?: string;
  tooltipItems?: string[];
}) {
  const hasTooltip = tooltipItems && tooltipItems.length > 0;

  if (!hasTooltip) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{value}</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="flex cursor-help items-center justify-between gap-3 text-sm" />}
      >
        <span className="decoration-muted-foreground/50 underline decoration-dotted underline-offset-4 text-muted-foreground">
          {label}
        </span>
        <span className="tabular-nums font-medium">{value}</span>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-80 px-3 py-3">
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="font-medium">{tooltipLabel ?? label}</p>
            {tooltipDescription ? <p className="text-background/75">{tooltipDescription}</p> : null}
          </div>
          <div className="space-y-1.5">
            {tooltipItems.map((item) => (
              <div key={item} className="rounded-sm bg-background/10 px-2 py-1">
                {item}
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function CalculationStep({
  state,
  actions,
}: {
  state: DashboardState;
  actions: DashboardActions;
}) {
  const { project, result } = state;
  const { handleCopy } = actions;
  const { locale, copy } = useI18n();
  const explanationLines = buildProjectExplanation(project, locale);
  const perNightItemLabels = project.costItems
    .filter((item) => item.distributionType === "per_night")
    .map((item) => item.label)
    .filter(Boolean);
  const perStayItemLabels = project.costItems
    .filter((item) => item.distributionType === "per_stay_person")
    .map((item) => item.label)
    .filter(Boolean);
  const headcountItemLabels = project.costItems
    .filter((item) => item.distributionType === "headcount")
    .map((item) => item.label)
    .filter(Boolean);
  const hasReviewableInput = project.participants.length > 0 && project.costItems.length > 0;
  const [copiedHh, setCopiedHh] = useState<string | null>(null);
  const [openHouseholdBreakdowns, setOpenHouseholdBreakdowns] = useState<string[]>([]);
  const [openExplanationItems, setOpenExplanationItems] = useState<string[]>([]);

  async function copyHouseholdBreakdown(householdId: string) {
    const text = buildHouseholdBreakdown(result, householdId, locale);
    await handleCopy(`hh-calc-${householdId}`, text);
    setCopiedHh(householdId);
    window.setTimeout(() => setCopiedHh((c) => (c === householdId ? null : c)), 1600);
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <SectionHeader title={copy.calculation.title} subtitle={copy.calculation.subtitle} />

      {/* Warnings / status */}
      {result.warnings.length > 0 ? (
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
      ) : hasReviewableInput ? (
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
            <Check className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {copy.calculation.successTitle}
            </p>
            <p className="text-xs text-emerald-600/80 mt-0.5">
              {copy.calculation.successDescription}
            </p>
          </div>
        </div>
      ) : null}

      {/* Hero total */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-primary/60 mb-2">
          {copy.calculation.totalCosts}
        </p>
        <p className="text-4xl font-extrabold tabular-nums tracking-tight text-primary">
          {euro(result.totalCosts, locale)}
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>
            {copy.calculation.includedCosts}:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {euro(result.includedCostsTotal, locale)}
            </span>
          </span>
          <span className="text-border">|</span>
          <span>
            {copy.calculation.excludedCosts}:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {euro(result.excludedCostsTotal, locale)}
            </span>
          </span>
          {!result.controlDifference.isZero() && (
            <>
              <span className="text-border">|</span>
              <span>
                {copy.calculation.difference}:{" "}
                <span className="font-medium text-destructive tabular-nums">
                  {euro(result.controlDifference, locale)}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Rate cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <RateCard
          icon={Moon}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          label={copy.calculation.perNight}
          rate={result.perNight.rate ? euro(result.perNight.rate, locale) : copy.common.na}
          total={euro(result.perNight.total, locale)}
          totalLabel={copy.common.total}
          divisor={result.perNight.divisor.toString()}
          divisorLabel={copy.calculation.divisorPersonNights}
        />
        <RateCard
          icon={ArrowRightLeft}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          label={copy.calculation.perStayPerson}
          rate={
            result.perStayPerson.rate ? euro(result.perStayPerson.rate, locale) : copy.common.na
          }
          total={euro(result.perStayPerson.total, locale)}
          totalLabel={copy.common.total}
          divisor={result.perStayPerson.divisor.toString()}
          divisorLabel={copy.calculation.divisorStayParticipants}
        />
        <RateCard
          icon={Users}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          label={copy.calculation.headcount}
          rate={result.headcount.rate ? euro(result.headcount.rate, locale) : copy.common.na}
          total={euro(result.headcount.total, locale)}
          totalLabel={copy.common.total}
          divisor={result.headcount.divisor.toString()}
          divisorLabel={copy.calculation.divisorParticipants}
        />
      </div>

      {/* Per-person breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/50">
              <Sigma className="size-4.5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{copy.calculation.perPerson}</CardTitle>
              <CardDescription>{copy.calculation.perPersonDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.calculation.name}</TableHead>
                  <TableHead>{copy.calculation.household}</TableHead>
                  <TableHead className="text-right">{copy.calculation.perNight}</TableHead>
                  <TableHead className="text-right">{copy.calculation.stay}</TableHead>
                  <TableHead className="text-right">{copy.calculation.headcount}</TableHead>
                  <TableHead className="text-right">{copy.common.total}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.participantBreakdowns.map((pb) => (
                  <TableRow key={pb.participantId} className="group">
                    <TableCell className="font-medium">{pb.participantName}</TableCell>
                    <TableCell>
                      {pb.householdId && !pb.householdId.startsWith("individual:") ? (
                        <Badge
                          variant="outline"
                          className="font-normal text-muted-foreground text-xs"
                        >
                          {pb.householdName}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {euro(pb.perNightTotal, locale)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {euro(pb.stayTotal, locale)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {euro(pb.headcountTotal, locale)}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {euro(pb.total, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-foreground transition-opacity"
                            />
                          }
                        >
                          {copy.common.details}
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{pb.participantName}</DialogTitle>
                            <DialogDescription>
                              {pb.householdName} &middot; {pb.nights}{" "}
                              {pb.nights === 1 ? copy.common.night : copy.common.nights}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-1 mt-2">
                            {pb.costItems.map((item) => (
                              <div
                                key={item.costItemId}
                                className="flex items-center justify-between py-2.5 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{item.label}</span>
                                  <Badge variant="outline" className="text-[10px] font-normal">
                                    {getDistributionLabel(locale, item.distributionType)}
                                  </Badge>
                                </div>
                                <span className="tabular-nums font-medium">
                                  {euro(item.exactAmount, locale)}
                                </span>
                              </div>
                            ))}
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between py-2 font-bold text-base">
                              <span>{copy.common.total}</span>
                              <span className="tabular-nums text-primary">
                                {euro(pb.total, locale)}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-1">
            {result.participantBreakdowns.map((pb) => (
              <div
                key={pb.participantId}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 text-xs font-bold text-muted-foreground">
                    {pb.participantName
                      .split(/\s+/)
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pb.participantName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {pb.householdName} &middot; {pb.nights}
                      {pb.nights === 1 ? copy.common.night.charAt(0) : copy.common.nights.charAt(0)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold tabular-nums">{euro(pb.total, locale)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-household breakdown — shareable */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/50">
              <Home className="size-4.5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{copy.calculation.perHousehold}</CardTitle>
              <CardDescription>{copy.calculation.perHouseholdDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.householdTotals.map((ht, i) => {
              const accent = HH_ACCENTS[i % HH_ACCENTS.length];
              const members = result.participantBreakdowns.filter(
                (pb) => pb.householdId === ht.householdId,
              );
              const directCosts = result.directHouseholdItems.filter(
                (d) => d.householdId === ht.householdId,
              );
              const isCopied = copiedHh === ht.householdId;
              const householdPerNightTotal = members.reduce(
                (sum, member) => sum.plus(member.perNightTotal),
                ZERO,
              );
              const householdStayTotal = members.reduce(
                (sum, member) => sum.plus(member.stayTotal),
                ZERO,
              );
              const householdHeadcountTotal = members.reduce(
                (sum, member) => sum.plus(member.headcountTotal),
                ZERO,
              );
              const exactTotal = ht.participantSubtotal.plus(ht.directCostsSubtotal);

              return (
                <div
                  key={ht.householdId}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-border/50 border-l-4 bg-card overflow-hidden transition-all hover:shadow-md",
                    accent.border,
                  )}
                >
                  {/* Header */}
                  <div className="border-b border-border/30 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("size-2 rounded-full", accent.dot)} />
                        <span className="text-sm font-semibold">{ht.householdName}</span>
                      </div>
                      <span className="text-lg font-bold tabular-nums">
                        {euro(ht.roundedDisplayTotal, locale)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted/50 px-2 py-1">
                        {members.length}{" "}
                        {members.length === 1 ? copy.common.person : copy.common.persons}
                      </span>
                      {directCosts.length > 0 && (
                        <span className="rounded-full bg-muted/50 px-2 py-1">
                          {directCosts.length} {copy.calculation.directItemsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 px-4 py-3">
                    <div className="space-y-2 rounded-xl bg-muted/25 p-3">
                      {members.map((m) => (
                        <div
                          key={m.participantId}
                          className="rounded-lg bg-background/80 px-3 py-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <span className="text-sm font-medium">{m.participantName}</span>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                <span>
                                  {m.nights}{" "}
                                  {m.nights === 1 ? copy.common.night : copy.common.nights}
                                </span>
                                {!m.perNightTotal.isZero() && (
                                  <span>
                                    {copy.calculation.perNight}: {euro(m.perNightTotal, locale)}
                                  </span>
                                )}
                                {!m.stayTotal.isZero() && (
                                  <span>
                                    {copy.calculation.stay}: {euro(m.stayTotal, locale)}
                                  </span>
                                )}
                                {!m.headcountTotal.isZero() && (
                                  <span>
                                    {copy.calculation.headcount}: {euro(m.headcountTotal, locale)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm tabular-nums font-semibold">
                              {euro(m.total, locale)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Accordion
                      value={
                        openHouseholdBreakdowns.includes(ht.householdId) ? [ht.householdId] : []
                      }
                      onValueChange={(value) => {
                        setOpenHouseholdBreakdowns((current) => {
                          const isOpen = value.includes(ht.householdId);
                          if (isOpen) {
                            return current.includes(ht.householdId)
                              ? current
                              : [...current, ht.householdId];
                          }
                          return current.filter((entry) => entry !== ht.householdId);
                        });
                      }}
                    >
                      <AccordionItem value={ht.householdId} className="border-b-0">
                        <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/35 hover:no-underline">
                          {copy.calculation.showBreakdown}
                        </AccordionTrigger>
                        <AccordionContent className="mt-3 pb-0">
                          <div className="rounded-xl border border-border/50 bg-muted/15 p-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {copy.calculation.buildUp}
                            </p>
                            <div className="space-y-2 text-sm">
                              {!householdPerNightTotal.isZero() && (
                                <BreakdownSummaryRow
                                  label={copy.calculation.nightShare}
                                  value={euro(householdPerNightTotal, locale)}
                                  tooltipLabel={`${copy.calculation.includesLabel} ${copy.calculation.nightShare.toLowerCase()}`}
                                  tooltipDescription={copy.calculation.includedItems}
                                  tooltipItems={perNightItemLabels}
                                />
                              )}
                              {!householdStayTotal.isZero() && (
                                <BreakdownSummaryRow
                                  label={copy.calculation.stayShare}
                                  value={euro(householdStayTotal, locale)}
                                  tooltipLabel={`${copy.calculation.includesLabel} ${copy.calculation.stayShare.toLowerCase()}`}
                                  tooltipDescription={copy.calculation.includedItems}
                                  tooltipItems={perStayItemLabels}
                                />
                              )}
                              {!householdHeadcountTotal.isZero() && (
                                <BreakdownSummaryRow
                                  label={copy.calculation.headcountShare}
                                  value={euro(householdHeadcountTotal, locale)}
                                  tooltipLabel={`${copy.calculation.includesLabel} ${copy.calculation.headcountShare.toLowerCase()}`}
                                  tooltipDescription={copy.calculation.includedItems}
                                  tooltipItems={headcountItemLabels}
                                />
                              )}
                              {directCosts.map((d) => (
                                <div
                                  key={d.costItemId}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {copy.calculation.directAssigned}: {d.label}
                                  </span>
                                  <span className="tabular-nums font-medium">
                                    {euro(d.exactAmount, locale)}
                                  </span>
                                </div>
                              ))}
                              <Separator className="opacity-60" />
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">
                                  {copy.calculation.exactTotal}
                                </span>
                                <span className="tabular-nums font-medium">
                                  {euro(exactTotal, locale)}
                                </span>
                              </div>
                              {!ht.roundingAdjustment.isZero() && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    {copy.common.rounding}
                                  </span>
                                  <span className="tabular-nums font-medium">
                                    {euro(ht.roundingAdjustment, locale)}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-3 pt-1 text-base">
                                <span className="font-semibold">{copy.calculation.finalTotal}</span>
                                <span className="tabular-nums font-bold text-primary">
                                  {euro(ht.roundedDisplayTotal, locale)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Copy button */}
                  <div className="mt-auto px-4 pb-3">
                    <Button
                      type="button"
                      variant={isCopied ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-full transition-all duration-200",
                        isCopied && "bg-primary text-primary-foreground",
                      )}
                      onClick={() => copyHouseholdBreakdown(ht.householdId)}
                    >
                      {isCopied ? (
                        <Check className="size-3.5 mr-1.5" />
                      ) : (
                        <Copy className="size-3.5 mr-1.5" />
                      )}
                      {isCopied ? copy.common.copied : copy.calculation.copyOverview}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      {explanationLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.calculation.explanation}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion
              className="w-full"
              value={openExplanationItems}
              onValueChange={(value) => setOpenExplanationItems(value)}
              multiple
            >
              {explanationLines.map((line) => (
                <AccordionItem key={line} value={line}>
                  <AccordionTrigger className="text-sm">{line}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {copy.calculation.explanationDescription}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
