"use client";

import { Calculator, Check, ChevronLeft, ChevronRight, Receipt, Send, Users } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { StepId } from "@/lib/dashboard-types";
import { getSteps } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STEP_ICONS = {
  participants: Users,
  costs: Receipt,
  review: Calculator,
  payments: Send,
} as const;

export function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
}) {
  const { locale, copy } = useI18n();
  const steps = getSteps(locale);
  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="mb-10">
      {/* Desktop */}
      <ol className="hidden sm:flex items-center justify-center gap-1">
        {steps.map((s, i) => {
          const Icon = STEP_ICONS[s.id];
          const isActive = s.id === currentStep;
          const isPast = i < stepIndex;
          return (
            <li key={s.id} className="flex items-center gap-1">
              {i > 0 && (
                <div
                  className={cn(
                    "h-px w-8 lg:w-12 transition-colors duration-300",
                    isPast ? "bg-primary/30" : "bg-border/60",
                  )}
                />
              )}
              <Button
                type="button"
                onClick={() => onStepClick(s.id)}
                variant="ghost"
                size="sm"
                className={cn(
                  "group relative h-10 rounded-full px-4 lg:px-5 text-sm font-medium transition-all duration-200",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary hover:text-primary-foreground",
                  isPast && !isActive && "text-primary/80 hover:bg-primary/5",
                  !isActive &&
                    !isPast &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {isPast && !isActive ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary/12">
                    <Check className="size-3 text-primary" />
                  </div>
                ) : (
                  <Icon className="size-4" />
                )}
                <span className="hidden lg:inline">{s.label}</span>
                <span className="lg:hidden">{s.label}</span>
              </Button>
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {copy.common.step} {stepIndex + 1}/{steps.length}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {steps[stepIndex].label}
            </span>
          </div>

          <div className="mb-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <p className="mb-3 text-sm font-medium text-foreground">{steps[stepIndex].description}</p>

          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = STEP_ICONS[s.id];
              const isActive = i === stepIndex;
              const isPast = i < stepIndex;

              return (
                <Button
                  key={s.id}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onStepClick(s.id)}
                  className={cn(
                    "flex-1 rounded-xl border-transparent transition-all shadow-none",
                    isActive &&
                      "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary hover:text-primary-foreground",
                    isPast &&
                      !isActive &&
                      "bg-primary/8 text-primary hover:bg-primary/12",
                    !isActive &&
                      !isPast &&
                      "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  {isPast && !isActive ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function StepNavigation({
  currentStep,
  onBack,
  onForward,
  forwardLabel,
  endAction,
}: {
  currentStep: StepId;
  onBack: () => void;
  onForward: () => void;
  forwardLabel: string;
  endAction?: React.ReactNode;
}) {
  const { locale, copy } = useI18n();
  const steps = getSteps(locale);
  const stepIndex = steps.findIndex((s) => s.id === currentStep);
  const canGoBack = stepIndex > 0;
  const canGoForward = stepIndex < steps.length - 1;

  return (
    <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
      <Button
        type="button"
        variant="ghost"
        disabled={!canGoBack}
        onClick={onBack}
        className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <ChevronLeft className="size-4" />
        {copy.common.back}
      </Button>
      {canGoForward ? (
        <Button
          type="button"
          size="default"
          onClick={onForward}
          className="h-10 gap-2 shadow-sm shadow-primary/15"
        >
          {forwardLabel}
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        endAction
      )}
    </div>
  );
}
