import type Decimal from "decimal.js";

export type DistributionType =
  | "per_night"
  | "per_stay_person"
  | "headcount"
  | "direct_household"
  | "excluded";

export type Household = {
  id: string;
  name: string;
};

export type Participant = {
  id: string;
  name: string;
  householdId?: string;
  nights: number;
  countInNightDistribution: boolean;
  countInStayCosts: boolean;
  countInHeadcountCosts: boolean;
  notes?: string;
};

export type CostItem = {
  id: string;
  label: string;
  amount: number;
  distributionType: DistributionType;
  assignedHouseholdId?: string;
  notes?: string;
};

export type ProjectData = {
  projectName?: string;
  projectDescription?: string;
  households: Household[];
  participants: Participant[];
  costItems: CostItem[];
};

export type DistributionSummary = {
  total: Decimal;
  divisor: Decimal;
  rate: Decimal | null;
};

export type CostItemBreakdown = {
  costItemId: string;
  label: string;
  distributionType: DistributionType;
  exactAmount: Decimal;
};

export type ParticipantBreakdown = {
  participantId: string;
  participantName: string;
  householdId?: string;
  householdName: string;
  nights: number;
  perNightTotal: Decimal;
  stayTotal: Decimal;
  headcountTotal: Decimal;
  total: Decimal;
  costItems: CostItemBreakdown[];
};

export type HouseholdTotal = {
  householdId: string;
  householdName: string;
  participantSubtotal: Decimal;
  directCostsSubtotal: Decimal;
  exactTotal: Decimal;
  roundedDisplayTotal: Decimal;
  roundingAdjustment: Decimal;
};

export type CalculationWarning = {
  code: string;
  message: string;
  level: "warning" | "error";
};

export type CalculationResult = {
  totalCosts: Decimal;
  includedCostsTotal: Decimal;
  excludedCostsTotal: Decimal;
  directHouseholdCostsTotal: Decimal;
  perNight: DistributionSummary;
  perStayPerson: DistributionSummary;
  headcount: DistributionSummary;
  participantBreakdowns: ParticipantBreakdown[];
  householdTotals: HouseholdTotal[];
  directHouseholdItems: Array<{
    householdId?: string;
    householdName?: string;
    label: string;
    exactAmount: Decimal;
    costItemId: string;
  }>;
  excludedItems: Array<{
    costItemId: string;
    label: string;
    exactAmount: Decimal;
  }>;
  warnings: CalculationWarning[];
  controlDifference: Decimal;
  householdRoundingDifference: Decimal;
};
