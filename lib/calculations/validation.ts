import { z } from "zod";
import type { CalculationWarning, ProjectData } from "@/lib/calculations/types";
import { formatValidationMessage, type Locale, translations } from "@/lib/i18n";

export const householdSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, translations.nl.validation.householdNameRequired),
});

export const participantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, translations.nl.validation.participantNameRequired),
  householdId: z.string().min(1).optional(),
  nights: z.number().min(0),
  countInNightDistribution: z.boolean(),
  countInStayCosts: z.boolean(),
  countInHeadcountCosts: z.boolean(),
  notes: z.string().optional(),
});

export const costItemSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1, translations.nl.validation.costItemNameRequired),
    amount: z.number().min(0),
    distributionType: z.enum([
      "per_night",
      "per_stay_person",
      "headcount",
      "direct_household",
      "excluded",
    ]),
    assignedHouseholdId: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((item, ctx) => {
    if (item.distributionType === "direct_household" && !item.assignedHouseholdId) {
      ctx.addIssue({
        code: "custom",
        message: translations.nl.validation.directHouseholdRequired,
        path: ["assignedHouseholdId"],
      });
    }
  });

export const projectSchema = z.object({
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  households: z.array(householdSchema),
  participants: z.array(participantSchema),
  costItems: z.array(costItemSchema),
});

export function validateProjectWarnings(
  data: ProjectData,
  locale: Locale = "nl",
): CalculationWarning[] {
  const warnings: CalculationWarning[] = [];
  const householdIds = new Set(data.households.map((household) => household.id));

  for (const participant of data.participants) {
    if (participant.householdId && !householdIds.has(participant.householdId)) {
      warnings.push({
        code: "participant-household-missing",
        level: "error",
        message: formatValidationMessage(locale, "participantHouseholdMissing", {
          name: participant.name,
        }),
      });
    }
  }

  for (const item of data.costItems) {
    if (item.distributionType === "direct_household" && !item.assignedHouseholdId) {
      warnings.push({
        code: "direct-household-missing",
        level: "error",
        message: formatValidationMessage(locale, "directHouseholdMissing", { label: item.label }),
      });
    }

    if (item.assignedHouseholdId && !householdIds.has(item.assignedHouseholdId)) {
      warnings.push({
        code: "cost-household-missing",
        level: "error",
        message: formatValidationMessage(locale, "costHouseholdMissing", { label: item.label }),
      });
    }
  }

  return warnings;
}
