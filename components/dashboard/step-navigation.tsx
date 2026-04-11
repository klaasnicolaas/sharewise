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
              <button
                type="button"
                onClick={() => onStepClick(s.id)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-full px-4 lg:px-5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/25",
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
              </button>
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {copy.common.step} {stepIndex + 1}/{steps.length}
          </span>
          <span className="text-xs font-semibold text-primary">{steps[stepIndex].label}</span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStepClick(s.id)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < stepIndex && "bg-primary/40",
                i === stepIndex && "bg-primary shadow-sm shadow-primary/30",
                i > stepIndex && "bg-border/60",
              )}
            />
          ))}
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
        <Button type="button" onClick={onForward} className="gap-2 shadow-sm shadow-primary/15">
          {forwardLabel}
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        endAction
      )}
    </div>
  );
}
