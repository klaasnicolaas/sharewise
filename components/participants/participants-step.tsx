"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Moon, Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { z } from "zod";
import type { Participant } from "@/lib/calculations/types";
import type { DashboardActions, DashboardState } from "@/lib/dashboard-types";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionHeader } from "@/components/dashboard/section-header";

/* ─── Schemas ────────────────────────────────────────────────── */
function getHouseholdFormSchema(message: string) {
  return z.object({
    name: z.string().min(1, message),
  });
}
type HouseholdFormValues = { name: string };

/* ─── Color palette for households ───────────────────────────── */
const HOUSEHOLD_COLORS = [
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200", dot: "bg-blue-500" },
  { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
  { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200", dot: "bg-violet-500" },
  { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
  { bg: "bg-cyan-100", text: "text-cyan-700", ring: "ring-cyan-200", dot: "bg-cyan-500" },
  { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200", dot: "bg-orange-500" },
  {
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-200",
    dot: "bg-fuchsia-500",
  },
];

function getHouseholdColor(index: number) {
  return HOUSEHOLD_COLORS[index % HOUSEHOLD_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ─── Participant setting tile ───────────────────────────────── */
function ParticipantSetting({
  checked,
  label,
  description,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => onCheckedChange(!checked)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors select-none",
              checked
                ? "border-primary/25 bg-primary/10 text-primary"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          />
        }
      >
        <Check
          className={cn(
            "size-3 shrink-0 transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
        {label}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-56 text-pretty">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Participant row within a household group ───────────────── */
function ParticipantRow({
  participant,
  colorScheme,
  isLast,
  householdOptions,
  onHouseholdChange,
  update,
  updateSync,
  copy,
}: {
  participant: Participant;
  colorScheme: (typeof HOUSEHOLD_COLORS)[number];
  isLast: boolean;
  householdOptions: Array<{ value: string; label: string }>;
  onHouseholdChange: (participantId: string, value: string) => void;
  update: DashboardActions["update"];
  updateSync: DashboardActions["updateSync"];
  copy: ReturnType<typeof useI18n>["copy"];
}) {
  const p = participant;
  const initials = getInitials(p.name || "?");
  const selectedHouseholdLabel =
    householdOptions.find((o) => o.value === p.householdId)?.label ??
    copy.participants.individualOption;

  const householdDropdownItems = (
    <>
      <DropdownMenuRadioGroup
        value={p.householdId ?? "__none__"}
        onValueChange={(value) => onHouseholdChange(p.id, value)}
      >
        <DropdownMenuRadioItem value="__none__">
          {copy.participants.individualOption}
        </DropdownMenuRadioItem>
        {householdOptions.map((opt) => (
          <DropdownMenuRadioItem key={opt.value} value={opt.value}>
            {opt.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => onHouseholdChange(p.id, "__create__")}>
        <Plus className="size-3.5" />
        {copy.participants.newHouseholdOption}
      </DropdownMenuItem>
    </>
  );

  const nightsPill = (
    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted/35 px-2 py-1">
      <Moon className="size-3 text-muted-foreground" />
      <Input
        type="number"
        min={0}
        step={1}
        value={p.nights}
        className="h-6 w-7 border-transparent bg-transparent p-0 text-center text-sm font-semibold tabular-nums shadow-none focus:border-border focus:bg-card"
        onChange={(e) =>
          update((d) => ({
            ...d,
            participants: d.participants.map((x) =>
              x.id === p.id ? { ...x, nights: Math.max(0, Number(e.target.value) || 0) } : x,
            ),
          }))
        }
      />
      <span className="hidden text-[10px] text-muted-foreground sm:inline">
        {copy.participants.nightsShort}
      </span>
    </div>
  );

  const settingPills = (
    <>
      <ParticipantSetting
        checked={p.countInNightDistribution}
        label={copy.participants.settingNightLabel}
        description={copy.participants.settingNightDescription}
        onCheckedChange={(checked) =>
          update((d) => ({
            ...d,
            participants: d.participants.map((x) =>
              x.id === p.id ? { ...x, countInNightDistribution: checked } : x,
            ),
          }))
        }
      />
      <ParticipantSetting
        checked={p.countInStayCosts}
        label={copy.participants.settingStayLabel}
        description={copy.participants.settingStayDescription}
        onCheckedChange={(checked) =>
          update((d) => ({
            ...d,
            participants: d.participants.map((x) =>
              x.id === p.id ? { ...x, countInStayCosts: checked } : x,
            ),
          }))
        }
      />
      <ParticipantSetting
        checked={p.countInHeadcountCosts}
        label={copy.participants.settingHeadcountLabel}
        description={copy.participants.settingHeadcountDescription}
        onCheckedChange={(checked) =>
          update((d) => ({
            ...d,
            participants: d.participants.map((x) =>
              x.id === p.id ? { ...x, countInHeadcountCosts: checked } : x,
            ),
          }))
        }
      />
    </>
  );

  return (
    <div
      className={cn(
        "group px-3 py-3 sm:px-4 sm:py-3",
        !isLast && "border-b border-border/20",
      )}
    >
      {/* ── Row 1 ── */}
      <div className="flex items-start gap-2">
        {/* Avatar — nudge down to align with name input */}
        <div
          className={cn(
            "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm",
            colorScheme.bg,
            colorScheme.text,
          )}
        >
          {initials}
        </div>

        {/* Name + nights sub-line (mobile) / name only (desktop) */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Input
            value={p.name}
            placeholder={copy.participants.participantPlaceholder}
            className="h-8 rounded-md border-transparent bg-transparent font-medium shadow-none transition-colors hover:bg-muted/30 focus:border-border focus:bg-card"
            onChange={(e) =>
              updateSync((d) => ({
                ...d,
                participants: d.participants.map((x) =>
                  x.id === p.id ? { ...x, name: e.target.value } : x,
                ),
              }))
            }
          />
          {/* Household dropdown + nights — visible below name on mobile only */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-7 flex-1 items-center justify-between gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-border hover:bg-muted/50">
                <span className="min-w-0 truncate">{selectedHouseholdLabel}</span>
                <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto">{householdDropdownItems}</DropdownMenuContent>
            </DropdownMenu>
            {nightsPill}
          </div>
        </div>

        {/* Desktop: household dropdown + nights */}
        <div className="hidden items-center gap-2 sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-36 items-center justify-between gap-1.5 rounded-md border border-border/60 bg-muted/15 px-2.5 text-[12px] font-medium text-foreground shadow-none transition-colors hover:bg-muted/25">
              <span className="truncate">{selectedHouseholdLabel}</span>
              <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">{householdDropdownItems}</DropdownMenuContent>
          </DropdownMenu>
          {nightsPill}
        </div>

        {/* Delete */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-1 size-8 shrink-0 text-muted-foreground/40 transition-all hover:bg-destructive/5 hover:text-destructive sm:mt-0"
          onClick={() =>
            update((d) => ({
              ...d,
              participants: d.participants.filter((x) => x.id !== p.id),
            }))
          }
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* ── Mobile Row 2: 3 toggle pills only, never wraps ── */}
      <div className="mt-2 flex items-center gap-1.5 pl-10 sm:hidden">
        {settingPills}
      </div>

      {/* ── Mobile Row 3: notes ── */}
      <div className="mt-1.5 flex items-center gap-1 pl-10 text-muted-foreground sm:hidden">
        <Pencil className="size-3 shrink-0" />
        <Input
          value={p.notes ?? ""}
          placeholder={copy.participants.notePlaceholder}
          className="h-7 min-w-0 flex-1 rounded-md border-transparent bg-transparent px-1 text-[11px] text-muted-foreground shadow-none focus:border-border focus:bg-card"
          onChange={(e) =>
            updateSync((d) => ({
              ...d,
              participants: d.participants.map((x) =>
                x.id === p.id ? { ...x, notes: e.target.value } : x,
              ),
            }))
          }
        />
      </div>

      {/* ── Desktop Row 2: notes + settings ── */}
      <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1.5 pl-10 sm:flex">
        <div className="flex min-w-0 flex-1 items-center gap-1 text-muted-foreground">
          <Pencil className="size-3 shrink-0" />
          <Input
            value={p.notes ?? ""}
            placeholder={copy.participants.notePlaceholder}
            className="h-7 min-w-0 flex-1 rounded-md border-transparent bg-transparent px-1 text-[11px] text-muted-foreground shadow-none focus:border-border focus:bg-card"
            onChange={(e) =>
              updateSync((d) => ({
                ...d,
                participants: d.participants.map((x) =>
                  x.id === p.id ? { ...x, notes: e.target.value } : x,
                ),
              }))
            }
          />
        </div>
        <div className="flex flex-wrap gap-1.5">{settingPills}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Main step                                                     */
/* ═══════════════════════════════════════════════════════════════ */
export function ParticipantsStep({
  state,
  actions,
}: {
  state: DashboardState;
  actions: DashboardActions;
}) {
  const { project, result } = state;
  const { update, updateSync, removeHousehold } = actions;
  const { copy } = useI18n();
  const householdOptions = project.households.map((household) => ({
    value: household.id,
    label: household.name || copy.common.unnamedHousehold,
  }));

  const householdForm = useForm<HouseholdFormValues>({
    resolver: zodResolver(getHouseholdFormSchema(copy.validation.householdNameRequired)),
    defaultValues: { name: "" },
  });

  // Group participants by household
  const groupedByHousehold = project.households.map((h, idx) => ({
    household: h,
    color: getHouseholdColor(idx),
    members: project.participants.filter((p) => p.householdId === h.id),
  }));
  const standaloneParticipants = project.participants.filter(
    (participant) => !participant.householdId,
  );

  function addParticipantToHousehold(householdId: string) {
    update((d) => ({
      ...d,
      participants: [
        ...d.participants,
        {
          id: createId("p"),
          name: "",
          householdId,
          nights: 2,
          countInNightDistribution: true,
          countInStayCosts: true,
          countInHeadcountCosts: true,
          notes: "",
        },
      ],
    }));
  }

  function addStandaloneParticipant() {
    update((d) => ({
      ...d,
      participants: [
        ...d.participants,
        {
          id: createId("p"),
          name: "",
          householdId: undefined,
          nights: 2,
          countInNightDistribution: true,
          countInStayCosts: true,
          countInHeadcountCosts: true,
          notes: "",
        },
      ],
    }));
  }

  function createHouseholdFromParticipant(participantId: string) {
    update((d) => {
      const participant = d.participants.find((entry) => entry.id === participantId);
      if (!participant || participant.householdId) {
        return d;
      }

      const householdId = createId("h");
      const householdName = participant.name.trim() || copy.participants.newHouseholdOption;

      return {
        ...d,
        households: [...d.households, { id: householdId, name: householdName }],
        participants: d.participants.map((entry) =>
          entry.id === participantId ? { ...entry, householdId } : entry,
        ),
      };
    });
  }

  function makeParticipantStandalone(participantId: string) {
    update((d) => {
      const participant = d.participants.find((entry) => entry.id === participantId);
      if (!participant?.householdId) {
        return d;
      }

      const householdMembers = d.participants.filter(
        (entry) => entry.householdId === participant.householdId,
      );
      const shouldRemoveHousehold = householdMembers.length === 1;

      return {
        ...d,
        households: shouldRemoveHousehold
          ? d.households.filter((entry) => entry.id !== participant.householdId)
          : d.households,
        participants: d.participants.map((entry) =>
          entry.id === participantId ? { ...entry, householdId: undefined } : entry,
        ),
        costItems: d.costItems.map((entry) =>
          shouldRemoveHousehold && entry.assignedHouseholdId === participant.householdId
            ? { ...entry, assignedHouseholdId: undefined }
            : entry,
        ),
      };
    });
  }

  function handleParticipantHouseholdChange(participantId: string, value: string) {
    if (value === "__create__") {
      createHouseholdFromParticipant(participantId);
      return;
    }

    if (value === "__none__") {
      makeParticipantStandalone(participantId);
      return;
    }

    update((d) => ({
      ...d,
      participants: d.participants.map((entry) =>
        entry.id === participantId
          ? {
              ...entry,
              householdId: value,
            }
          : entry,
      ),
    }));
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <SectionHeader title={copy.participants.title} subtitle={copy.participants.subtitle} />

      {/* ── Quick stats as inline badges ──────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{project.participants.length}</span>{" "}
            {copy.participants.statsParticipants}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm">
          <Moon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {result.perNight.divisor.toString()}
            </span>{" "}
            {copy.participants.statsPersonNights}
          </span>
        </div>
      </div>

      {/* ── Household bubbles ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {copy.participants.households}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={addStandaloneParticipant}
          >
            <UserPlus className="size-3.5" />
            {copy.participants.addIndividual}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {project.households.map((h, idx) => {
            const color = getHouseholdColor(idx);
            const memberCount = project.participants.filter((p) => p.householdId === h.id).length;

            return (
              <div
                key={h.id}
                className={cn(
                  "group relative flex items-center gap-2 rounded-2xl px-4 py-2.5 ring-1 ring-inset transition-all duration-150",
                  color.bg,
                  color.ring,
                )}
              >
                <span className={cn("size-2 rounded-full", color.dot)} />

                <Input
                  value={h.name}
                  className={cn(
                    "h-6 w-28 border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0 hover:bg-white/30 focus:bg-white/50 rounded-md px-1 -mx-1 transition-colors",
                    color.text,
                  )}
                  onChange={(e) =>
                    updateSync((d) => ({
                      ...d,
                      households: d.households.map((x) =>
                        x.id === h.id ? { ...x, name: e.target.value } : x,
                      ),
                    }))
                  }
                />

                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 min-w-5 justify-center rounded-full border-0 px-1.5 text-[10px] font-bold",
                    color.bg,
                    color.text,
                  )}
                >
                  {memberCount}
                </Badge>

                {/* Delete on hover */}
                {project.households.length > 1 && (
                  <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive/75 hover:bg-destructive/5 hover:text-destructive"
                            onClick={() => removeHousehold(h.id)}
                          />
                        }
                      >
                        <X className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {copy.participants.removeHousehold}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add household inline */}
          <form
            className="flex items-center"
            onSubmit={householdForm.handleSubmit(({ name }) => {
              update((d) => ({
                ...d,
                households: [...d.households, { id: createId("h"), name }],
              }));
              householdForm.reset({ name: "" });
            })}
          >
            <div className="flex items-center gap-1.5 rounded-2xl border border-dashed border-border/60 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-within:border-primary/40 focus-within:bg-primary/5">
              <Plus className="size-3.5 text-muted-foreground" />
              <Input
                placeholder={copy.participants.newHouseholdOption}
                className="h-6 w-32 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                {...householdForm.register("name")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    householdForm.handleSubmit(({ name }) => {
                      update((d) => ({
                        ...d,
                        households: [...d.households, { id: createId("h"), name }],
                      }));
                      householdForm.reset({ name: "" });
                    })();
                  }
                }}
              />
            </div>
          </form>
        </div>
        {householdForm.formState.errors.name && (
          <p className="text-xs text-destructive">{householdForm.formState.errors.name.message}</p>
        )}
      </div>

      {/* ── Grouped participant cards ─────────────────────── */}
      <div className="space-y-5">
        {groupedByHousehold.map(({ household, color, members }) => (
          <div
            key={household.id}
            className={cn(
              "overflow-hidden rounded-2xl border border-border/50 bg-card",
              "ring-1 ring-inset ring-border/20",
            )}
          >
            {/* Household header band */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-3.5 border-b",
                color.bg,
                color.ring,
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("size-2.5 rounded-full", color.dot)} />
                <Input
                  value={household.name}
                  className={cn(
                    "h-7 w-40 border-transparent bg-transparent px-1.5 text-sm font-bold shadow-none rounded-md transition-colors hover:bg-white/40 focus:bg-white/60 focus:border-border",
                    color.text,
                  )}
                  onChange={(e) =>
                    updateSync((d) => ({
                      ...d,
                      households: d.households.map((x) =>
                        x.id === household.id ? { ...x, name: e.target.value } : x,
                      ),
                    }))
                  }
                />
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 rounded-full border-0 px-2 text-[10px] font-semibold",
                    "bg-white/60",
                    color.text,
                  )}
                >
                  {members.length} {members.length === 1 ? copy.common.person : copy.common.persons}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn("h-7 gap-1 text-xs font-medium", color.text, "hover:bg-white/40")}
                onClick={() => addParticipantToHousehold(household.id)}
              >
                <UserPlus className="size-3.5" />
                {copy.participants.addParticipant}
              </Button>
            </div>

            {/* Members list */}
            <div className="px-4 divide-y-0">
              {members.length > 0 ? (
                members.map((p, idx) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    colorScheme={color}
                    isLast={idx === members.length - 1}
                    householdOptions={householdOptions}
                    onHouseholdChange={handleParticipantHouseholdChange}
                    update={update}
                    updateSync={updateSync}
                    copy={copy}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full mb-2",
                      color.bg,
                    )}
                  >
                    <Users className={cn("size-5", color.text, "opacity-50")} />
                  </div>
                  <p className="text-xs text-muted-foreground">{copy.participants.emptyTitle}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => addParticipantToHousehold(household.id)}
                  >
                    <Plus className="size-3 mr-1" />
                    {copy.participants.addParticipant}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {standaloneParticipants.length > 0 && (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border/50 bg-card",
              "ring-1 ring-inset ring-border/20",
            )}
          >
            <div className="flex items-center justify-between border-b border-border/30 bg-muted/35 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="size-2.5 rounded-full bg-foreground/45" />
                <span className="text-sm font-bold text-foreground">{copy.common.individual}</span>
                <Badge
                  variant="outline"
                  className="h-5 rounded-full border-0 bg-background/80 px-2 text-[10px] font-semibold text-foreground"
                >
                  {standaloneParticipants.length}{" "}
                  {standaloneParticipants.length === 1 ? copy.common.person : copy.common.persons}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs font-medium"
                onClick={addStandaloneParticipant}
              >
                <UserPlus className="size-3.5" />
                {copy.participants.addParticipant}
              </Button>
            </div>

            <div className="px-4 divide-y-0">
              {standaloneParticipants.map((participant, idx) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  colorScheme={{
                    bg: "bg-muted",
                    text: "text-foreground",
                    ring: "ring-border",
                    dot: "bg-foreground/45",
                  }}
                  isLast={idx === standaloneParticipants.length - 1}
                  householdOptions={householdOptions}
                  onHouseholdChange={handleParticipantHouseholdChange}
                  update={update}
                  updateSync={updateSync}
                  copy={copy}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {project.participants.length === 0 && project.households.length > 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-muted/40 mb-4">
            <Users className="size-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {copy.participants.firstParticipant}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">{copy.participants.emptySubtitle}</p>
        </div>
      )}
    </div>
  );
}
