"use client";

import {
  ArrowRightLeft,
  Banknote,
  ChevronDown,
  EyeOff,
  Home,
  Moon,
  Plus,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import type { DistributionType } from "@/lib/calculations/types";
import { decimalInputToNumber, euro } from "@/lib/calculations/money";
import { useI18n } from "@/components/i18n-provider";
import type { DashboardActions, DashboardState } from "@/lib/dashboard-types";
import { getDistributionOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/dashboard/section-header";

/* ─── Distribution type visual config ────────────────────────── */
const DISTRIBUTION_VISUALS: Record<
  DistributionType,
  { icon: typeof Moon; color: string; bg: string }
> = {
  per_night: { icon: Moon, color: "text-blue-600", bg: "bg-blue-50" },
  per_stay_person: { icon: ArrowRightLeft, color: "text-violet-600", bg: "bg-violet-50" },
  headcount: { icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  direct_household: { icon: Home, color: "text-emerald-600", bg: "bg-emerald-50" },
  excluded: { icon: EyeOff, color: "text-gray-400", bg: "bg-gray-50" },
};

/* ─── Summary card ───────────────────────────────────────────── */
function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Banknote;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          accent ? "bg-primary/10" : "bg-muted/50",
        )}
      >
        <Icon className={cn("size-5", accent ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </p>
        <p
          className={cn(
            "text-lg font-bold tabular-nums tracking-tight truncate",
            accent && "text-primary",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Costs Step                                                    */
/* ═══════════════════════════════════════════════════════════════ */
export function CostsStep({
  state,
  actions,
}: {
  state: DashboardState;
  actions: DashboardActions;
}) {
  const { project, result, householdOptions } = state;
  const { update, updateSync, addCostItem } = actions;
  const { locale, copy } = useI18n();
  const distributionOptions = getDistributionOptions(locale);

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <SectionHeader title={copy.costs.title} subtitle={copy.costs.subtitle}>
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={addCostItem}
          className="h-10 gap-2 shadow-sm"
        >
          <Plus className="size-4 mr-1.5" />
          {copy.costs.addItem}
        </Button>
      </SectionHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label={copy.costs.total}
          value={euro(result.includedCostsTotal, locale)}
          icon={Banknote}
          accent
        />
        <SummaryCard
          label={copy.costs.perNight}
          value={euro(result.perNight.total, locale)}
          icon={Moon}
        />
        <SummaryCard
          label={copy.costs.headcount}
          value={euro(result.headcount.total, locale)}
          icon={Users}
        />
        <SummaryCard
          label={copy.costs.direct}
          value={euro(result.directHouseholdCostsTotal, locale)}
          icon={Home}
        />
      </div>

      {/* Cost items */}
      <div className="space-y-2.5">
        {project.costItems.map((c) => {
          const visual = DISTRIBUTION_VISUALS[c.distributionType];
          const DistIcon = visual.icon;

          return (
            <div
              key={c.id}
              className="group rounded-2xl border border-border/50 bg-card transition-all duration-200 hover:shadow-md hover:border-border/80 overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Distribution type color accent */}
                <div className={cn("w-1 shrink-0", visual.bg)} />

                <div className="relative flex-1 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Type icon + label — takes remaining space */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 pr-10 sm:pr-0">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          visual.bg,
                        )}
                      >
                        <DistIcon className={cn("size-4", visual.color)} />
                      </div>
                      <Input
                        value={c.label}
                        placeholder={copy.costs.descriptionPlaceholder}
                        className="flex-1 h-9 rounded-md border-transparent bg-transparent font-medium shadow-none hover:bg-muted/30 focus:border-border focus:bg-card transition-colors"
                        onChange={(e) =>
                          updateSync((d) => ({
                            ...d,
                            costItems: d.costItems.map((x) =>
                              x.id === c.id ? { ...x, label: e.target.value } : x,
                            ),
                          }))
                        }
                      />
                    </div>

                    {/* Amount — fixed width */}
                    <div className="flex items-center gap-1.5 shrink-0 rounded-lg bg-muted/30 px-2 py-1 sm:w-28">
                      <span className="text-sm font-semibold text-muted-foreground/70">€</span>
                      <Input
                        inputMode="decimal"
                        value={String(c.amount)}
                        className="w-full h-7 border-transparent bg-transparent p-0 text-right tabular-nums font-semibold text-sm shadow-none focus:bg-card focus:border-border"
                        onChange={(e) =>
                          updateSync((d) => ({
                            ...d,
                            costItems: d.costItems.map((x) =>
                              x.id === c.id
                                ? { ...x, amount: decimalInputToNumber(e.target.value) }
                                : x,
                            ),
                          }))
                        }
                      />
                    </div>

                    {/* Distribution dropdown — fixed width */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/15 px-2.5 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted/25 sm:w-52">
                        <span className="flex items-center gap-2">
                          <DistIcon className={cn("size-3.5 shrink-0", visual.color)} />
                          <span className="truncate">
                            {distributionOptions.find((o) => o.value === c.distributionType)?.label}
                          </span>
                        </span>
                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto">
                        <DropdownMenuRadioGroup
                          value={c.distributionType}
                          onValueChange={(v) => {
                            if (v)
                              update((d) => ({
                                ...d,
                                costItems: d.costItems.map((x) =>
                                  x.id === c.id
                                    ? {
                                        ...x,
                                        distributionType: v as DistributionType,
                                        assignedHouseholdId:
                                          v === "direct_household"
                                            ? (x.assignedHouseholdId ?? d.households[0]?.id)
                                            : undefined,
                                      }
                                    : x,
                                ),
                              }));
                          }}
                        >
                          {distributionOptions.map((o) => {
                            const OptIcon = DISTRIBUTION_VISUALS[o.value].icon;
                            return (
                              <DropdownMenuRadioItem key={o.value} value={o.value}>
                                <OptIcon
                                  className={cn(
                                    "size-3.5 shrink-0",
                                    DISTRIBUTION_VISUALS[o.value].color,
                                  )}
                                />
                                {o.label}
                              </DropdownMenuRadioItem>
                            );
                          })}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Household dropdown for direct — fixed width */}
                    {c.distributionType === "direct_household" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/15 px-2.5 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted/25 sm:w-auto">
                          <span className="truncate">
                            {householdOptions.find((o) => o.value === c.assignedHouseholdId)
                              ?.label ?? copy.costs.householdPlaceholder}
                          </span>
                          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto">
                          <DropdownMenuRadioGroup
                            value={c.assignedHouseholdId ?? ""}
                            onValueChange={(v) => {
                              if (v)
                                update((d) => ({
                                  ...d,
                                  costItems: d.costItems.map((x) =>
                                    x.id === c.id ? { ...x, assignedHouseholdId: v } : x,
                                  ),
                                }));
                            }}
                          >
                            {householdOptions.map((o) => (
                              <DropdownMenuRadioItem key={o.value} value={o.value}>
                                {o.label}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="hidden" />
                    )}

                    {/* Delete — fixed width */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 size-8 shrink-0 text-muted-foreground/55 opacity-100 transition-all hover:bg-destructive/5 hover:text-destructive sm:static sm:self-auto sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() =>
                        update((d) => ({
                          ...d,
                          costItems: d.costItems.filter((x) => x.id !== c.id),
                        }))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {project.costItems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-muted/40 mb-4">
              <Receipt className="size-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{copy.costs.emptyTitle}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{copy.costs.emptySubtitle}</p>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="mt-4 h-10 gap-2"
              onClick={addCostItem}
            >
              <Plus className="size-4 mr-1" />
              {copy.costs.firstItem}
            </Button>
          </div>
        )}
      </div>

      {/* Special items */}
      {(result.directHouseholdItems.length > 0 || result.excludedItems.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.costs.specialItems}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {result.directHouseholdItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex size-6 items-center justify-center rounded-md bg-emerald-50">
                    <Home className="size-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    {copy.costs.directToHousehold}
                  </p>
                </div>
                {result.directHouseholdItems.map((item) => (
                  <div
                    key={item.costItemId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span>
                      {item.label}{" "}
                      <span className="text-muted-foreground">
                        ({item.householdName ?? copy.costs.unknownHousehold})
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {euro(item.exactAmount, locale)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {result.excludedItems.length > 0 && (
              <>
                {result.directHouseholdItems.length > 0 && <Separator />}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex size-6 items-center justify-center rounded-md bg-gray-50">
                      <EyeOff className="size-3.5 text-gray-400" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      {copy.costs.excluded}
                    </p>
                  </div>
                  {result.excludedItems.map((item) => (
                    <div
                      key={item.costItemId}
                      className="flex items-center justify-between py-2 text-sm text-muted-foreground"
                    >
                      <span>{item.label}</span>
                      <span className="tabular-nums">{euro(item.exactAmount, locale)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
