import type { CalculationResult, ProjectData } from "@/lib/calculations/types";

export const STEP_IDS = ["participants", "costs", "review", "payments"] as const;

export type StepId = (typeof STEP_IDS)[number];

export type DashboardActions = {
  update: (fn: (d: ProjectData) => ProjectData) => void;
  updateSync: (fn: (d: ProjectData) => ProjectData) => void;
  handleCopy: (key: string, text: string) => Promise<void>;
  addParticipant: () => void;
  addCostItem: () => void;
  removeHousehold: (id: string) => void;
};

export type DashboardState = {
  project: ProjectData;
  result: CalculationResult;
  copyState: string | null;
  householdOptions: Array<{ value: string; label: string }>;
};
