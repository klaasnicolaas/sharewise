"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { calculateProject } from "@/lib/calculations/calculate";
import { buildTikkieSummary } from "@/lib/calculations/selectors";
import type { ProjectData } from "@/lib/calculations/types";
import { projectSchema } from "@/lib/calculations/validation";
import {
  STEP_IDS,
  type DashboardActions,
  type DashboardState,
  type StepId,
} from "@/lib/dashboard-types";
import { getSteps } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalculationStep } from "@/components/calculation/calculation-step";
import { CostsStep } from "@/components/costs/costs-step";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ImportDialog } from "@/components/dashboard/import-dialog";
import { StepIndicator, StepNavigation } from "@/components/dashboard/step-navigation";
import { PaymentsStep } from "@/components/payments/payments-step";
import { ParticipantsStep } from "@/components/participants/participants-step";
import {
  ResponsiveDialogBody,
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";

/* ─── Helpers ────────────────────────────────────────────────── */
function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function copyProjectData(source: ProjectData): ProjectData {
  return {
    projectName: source.projectName ?? "",
    projectDescription: source.projectDescription ?? "",
    households: source.households.map((h) => ({ ...h })),
    participants: source.participants.map((p) => ({ ...p })),
    costItems: source.costItems.map((c) => ({ ...c })),
  };
}

function createEmptyProjectData(): ProjectData {
  return {
    projectName: "",
    projectDescription: "",
    households: [],
    participants: [],
    costItems: [],
  };
}

function slugifyFilePart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createExportFileName(projectName?: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const namePart = slugifyFilePart(projectName || "") || "project-data";

  return `sharewise-${namePart}-${year}-${month}-${day}.json`;
}

const PROJECT_STORAGE_KEY = "sharewise-project-draft-v1";
const PROJECT_CHANGE_EVENT = "sharewise:projectchange";
const STEP_CHANGE_EVENT = "sharewise:stepchange";

function isEmptyProjectData(source: ProjectData) {
  return (
    !source.projectName?.trim() &&
    !source.projectDescription?.trim() &&
    source.households.length === 0 &&
    source.participants.length === 0 &&
    source.costItems.length === 0
  );
}

function readStoredProjectData() {
  try {
    const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const result = projectSchema.safeParse(parsed);
    if (!result.success) {
      window.localStorage.removeItem(PROJECT_STORAGE_KEY);
      return null;
    }

    return copyProjectData(result.data);
  } catch {
    window.localStorage.removeItem(PROJECT_STORAGE_KEY);
    return null;
  }
}

function isStepId(value: string | null): value is StepId {
  return value !== null && STEP_IDS.includes(value as StepId);
}

function readProjectSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PROJECT_STORAGE_KEY) ?? "";
}

function subscribeToProjectSnapshot(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(PROJECT_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(PROJECT_CHANGE_EVENT, handler);
  };
}

function readStepSnapshot(): StepId {
  if (typeof window === "undefined") {
    return "participants";
  }

  const urlStep = new URLSearchParams(window.location.search).get("step");
  return isStepId(urlStep) ? urlStep : "participants";
}

function subscribeToStepSnapshot(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("popstate", handler);
  window.addEventListener(STEP_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener(STEP_CHANGE_EVENT, handler);
  };
}

function updateStepSearchParam(nextStep: StepId, mode: "push" | "replace" = "push") {
  const url = new URL(window.location.href);

  if (nextStep === "participants") {
    url.searchParams.delete("step");
  } else {
    url.searchParams.set("step", nextStep);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (mode === "replace") {
    window.history.replaceState(null, "", nextUrl);
    window.dispatchEvent(new Event(STEP_CHANGE_EVENT));
    return;
  }

  window.history.pushState(null, "", nextUrl);
  window.dispatchEvent(new Event(STEP_CHANGE_EVENT));
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Main component                                                */
/* ═══════════════════════════════════════════════════════════════ */
export function SharewiseDashboard({ initialStep }: { initialStep: StepId }) {
  const { locale, copy } = useI18n();
  const projectSnapshot = useSyncExternalStore(
    subscribeToProjectSnapshot,
    readProjectSnapshot,
    () => "",
  );
  const step = useSyncExternalStore(
    subscribeToStepSnapshot,
    readStepSnapshot,
    () => initialStep,
  );
  const [copyState, setCopyState] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [renderedStep, setRenderedStep] = useState<StepId>(initialStep);
  const [stepTransitionState, setStepTransitionState] = useState<"idle" | "out" | "in">("idle");
  const [stepTransitionDirection, setStepTransitionDirection] = useState<"forward" | "backward">(
    "forward",
  );
  const stepTransitionTimeoutRef = useRef<number | null>(null);
  const stepTransitionFrameRef = useRef<number | null>(null);

  const project = useMemo(() => {
    if (!projectSnapshot) {
      return createEmptyProjectData();
    }

    try {
      const parsed = JSON.parse(projectSnapshot);
      const result = projectSchema.safeParse(parsed);
      return result.success ? copyProjectData(result.data) : createEmptyProjectData();
    } catch {
      return createEmptyProjectData();
    }
  }, [projectSnapshot]);

  const steps = getSteps(locale);
  const result = useMemo(() => calculateProject(project, locale), [locale, project]);
  const householdOptions = project.households.map((h) => ({ value: h.id, label: h.name }));
  const stepIndex = steps.findIndex((s) => s.id === step);
  const renderedStepIndex = steps.findIndex((s) => s.id === renderedStep);
  const paymentSummaryText = buildTikkieSummary(result, locale);

  useEffect(() => {
    const initialUrlStep = new URLSearchParams(window.location.search).get("step");
    if (initialUrlStep && !isStepId(initialUrlStep)) {
      updateStepSearchParam("participants", "replace");
    }
  }, [initialStep]);

  useEffect(() => {
    if (step === renderedStep) {
      return;
    }

    if (stepTransitionFrameRef.current !== null) {
      window.cancelAnimationFrame(stepTransitionFrameRef.current);
    }

    if (stepTransitionTimeoutRef.current !== null) {
      window.clearTimeout(stepTransitionTimeoutRef.current);
    }

    stepTransitionFrameRef.current = window.requestAnimationFrame(() => {
      setStepTransitionDirection(stepIndex >= renderedStepIndex ? "forward" : "backward");
      setStepTransitionState("out");
      stepTransitionFrameRef.current = null;
    });

    stepTransitionTimeoutRef.current = window.setTimeout(() => {
      setRenderedStep(step);
      setStepTransitionState("in");

      stepTransitionTimeoutRef.current = window.setTimeout(() => {
        setStepTransitionState("idle");
        stepTransitionTimeoutRef.current = null;
      }, 220);
    }, 160);

    return () => {
      if (stepTransitionFrameRef.current !== null) {
        window.cancelAnimationFrame(stepTransitionFrameRef.current);
        stepTransitionFrameRef.current = null;
      }
      if (stepTransitionTimeoutRef.current !== null) {
        window.clearTimeout(stepTransitionTimeoutRef.current);
        stepTransitionTimeoutRef.current = null;
      }
    };
  }, [renderedStep, renderedStepIndex, step, stepIndex]);

  useEffect(() => {
    if (!projectSnapshot) {
      return;
    }

    const parsedProject = readStoredProjectData();
    if (!parsedProject) {
      window.localStorage.removeItem(PROJECT_STORAGE_KEY);
      return;
    }

    const normalizedProject = JSON.stringify(parsedProject);
    if (normalizedProject !== projectSnapshot) {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, normalizedProject);
      window.dispatchEvent(new Event(PROJECT_CHANGE_EVENT));
    }
  }, [projectSnapshot]);

  function commitProject(nextProject: ProjectData) {
    if (isEmptyProjectData(nextProject)) {
      window.localStorage.removeItem(PROJECT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(nextProject));
    }

    window.dispatchEvent(new Event(PROJECT_CHANGE_EVENT));
  }

  /* ─── Actions ────────────────────────────────────────────── */
  function update(fn: (d: ProjectData) => ProjectData) {
    commitProject(fn(project));
  }

  function updateSync(fn: (d: ProjectData) => ProjectData) {
    commitProject(fn(project));
  }

  function flash(key: string) {
    setCopyState(key);
    window.setTimeout(() => setCopyState((c) => (c === key ? null : c)), 1600);
  }

  async function handleCopy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    flash(key);
  }

  function setStepWithUrl(nextStep: StepId, mode: "push" | "replace" = "push") {
    updateStepSearchParam(nextStep, mode);
  }

  function handleResetAll() {
    commitProject(createEmptyProjectData());
    setStepWithUrl("participants", "replace");
    setCopyState(null);
    setIsResetOpen(false);
  }

  function handleResetCostsOnly() {
    commitProject({
      ...project,
      costItems: [],
    });
    setStepWithUrl("costs", "replace");
    setCopyState(null);
    setIsResetOpen(false);
  }

  function addParticipant() {
    update((d) => ({
      ...d,
      participants: [
        ...d.participants,
        {
          id: createId("p"),
          name: "",
          householdId: d.households[0]?.id,
          nights: 2,
          countInNightDistribution: true,
          countInStayCosts: true,
          countInHeadcountCosts: true,
          notes: "",
        },
      ],
    }));
  }

  function addCostItem() {
    update((d) => ({
      ...d,
      costItems: [
        ...d.costItems,
        {
          id: createId("c"),
          label: "",
          amount: 0,
          distributionType: "per_night",
          assignedHouseholdId: d.households[0]?.id,
          notes: "",
        },
      ],
    }));
  }

  function removeHousehold(id: string) {
    update((d) => {
      return {
        ...d,
        households: d.households.filter((h) => h.id !== id),
        participants: d.participants.map((p) =>
          p.householdId === id ? { ...p, householdId: undefined } : p,
        ),
        costItems: d.costItems.map((c) =>
          c.assignedHouseholdId === id ? { ...c, assignedHouseholdId: undefined } : c,
        ),
      };
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = createExportFileName(project.projectName);
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── State & actions for child components ───────────────── */
  const dashboardState: DashboardState = {
    project,
    result,
    copyState,
    householdOptions,
  };

  const dashboardActions: DashboardActions = {
    update,
    updateSync,
    handleCopy,
    addParticipant,
    addCostItem,
    removeHousehold,
  };

  function goBack() {
    if (stepIndex > 0) setStepWithUrl(steps[stepIndex - 1].id);
  }
  function goForward() {
    if (stepIndex < steps.length - 1) setStepWithUrl(steps[stepIndex + 1].id);
  }

  function renderStepContent(activeStep: StepId) {
    if (activeStep === "participants") {
      return <ParticipantsStep state={dashboardState} actions={dashboardActions} />;
    }
    if (activeStep === "costs") {
      return <CostsStep state={dashboardState} actions={dashboardActions} />;
    }
    if (activeStep === "review") {
      return <CalculationStep state={dashboardState} actions={dashboardActions} />;
    }
    return <PaymentsStep state={dashboardState} actions={dashboardActions} />;
  }

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader
        isPending={false}
        onReset={() => setIsResetOpen(true)}
        onExport={exportJson}
        onImportClick={() => setIsImportOpen(true)}
      />

      <ResponsiveDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <ResponsiveDialogContent
          className="p-0"
          dialogClassName="max-w-md border border-border/70 bg-card/96 shadow-lg"
        >
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{copy.header.resetTitle}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{copy.header.resetDescription}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full items-start justify-start rounded-2xl px-4 py-3.5 text-left"
              onClick={handleResetCostsOnly}
            >
              <span className="block text-sm font-semibold text-foreground">
                {copy.header.resetCostsOnly}
              </span>
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                {copy.header.resetCostsHelp}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-start rounded-2xl px-4 py-3.5 text-left"
              onClick={handleResetAll}
            >
              <span className="block text-sm font-semibold text-foreground">
                {copy.header.resetAll}
              </span>
            </Button>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>
              {copy.common.cancel}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={(data) => commitProject(copyProjectData(data))}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
          <div className="mb-8 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-xs">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{copy.project.details}</p>
                <p className="mt-1 text-sm text-muted-foreground">{copy.project.detailsHelp}</p>
              </div>
              <div className="hidden rounded-full bg-muted/45 px-3 py-1 text-xs font-medium text-muted-foreground sm:block">
                {stepIndex + 1}/{steps.length}
              </div>
            </div>
            <div className="grid gap-3">
              <Input
                value={project.projectName ?? ""}
                placeholder={copy.project.namePlaceholder}
                className="h-10 border-border/80 bg-background"
                onChange={(event) =>
                  updateSync((current) => ({
                    ...current,
                    projectName: event.target.value,
                  }))
                }
              />
              <Textarea
                value={project.projectDescription ?? ""}
                placeholder={copy.project.descriptionPlaceholder}
                rows={2}
                className="min-h-18 border-border/80 bg-background text-sm"
                onChange={(event) =>
                  updateSync((current) => ({
                    ...current,
                    projectDescription: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <StepIndicator currentStep={step} onStepClick={setStepWithUrl} />

          <div
            className="step-transition-shell"
            data-step-transition={stepTransitionState}
            data-step-direction={stepTransitionDirection}
          >
            <div key={renderedStep} className="step-transition-panel">
              {renderStepContent(renderedStep)}
            </div>
          </div>

          <StepNavigation
            currentStep={step}
            onBack={goBack}
            onForward={goForward}
            forwardLabel={stepIndex < steps.length - 1 ? steps[stepIndex + 1].label : ""}
            endAction={
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => handleCopy("payments", paymentSummaryText)}
                className="h-10 justify-center gap-2 shadow-sm"
              >
                {copyState === "payments" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copy.calculation.copyPaymentSummary}
              </Button>
            }
          />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
