import Decimal from "decimal.js";
import { allocateRoundedCents, money, ZERO } from "@/lib/calculations/money";
import type {
  CalculationResult,
  CalculationWarning,
  CostItem,
  CostItemBreakdown,
  DistributionSummary,
  HouseholdTotal,
  Participant,
  ParticipantBreakdown,
  ProjectData,
} from "@/lib/calculations/types";
import { validateProjectWarnings } from "@/lib/calculations/validation";
import type { Locale } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

function sumCosts(items: CostItem[]) {
  return items.reduce((sum, item) => sum.plus(item.amount), ZERO);
}

function buildSummary(total: Decimal, divisor: Decimal): DistributionSummary {
  return {
    total,
    divisor,
    rate: divisor.gt(0) ? total.div(divisor) : null,
  };
}

function getBillingGroupId(participant: Participant) {
  return participant.householdId ?? `individual:${participant.id}`;
}

function distributePerParticipant(
  participant: Participant,
  items: CostItem[],
  divisor: Decimal,
  units: Decimal.Value,
) {
  if (divisor.lte(0)) return { total: ZERO, costItems: [] as CostItemBreakdown[] };

  const costItems = items.map((item) => ({
    costItemId: item.id,
    label: item.label,
    distributionType: item.distributionType,
    exactAmount: money(item.amount).div(divisor).times(units),
  }));

  return {
    total: costItems.reduce((sum, item) => sum.plus(item.exactAmount), ZERO),
    costItems,
  };
}

export function calculateProject(data: ProjectData, locale: Locale = "nl"): CalculationResult {
  const warnings: CalculationWarning[] = [...validateProjectWarnings(data, locale)];
  const copy = translations[locale];
  const householdsById = new Map(data.households.map((household) => [household.id, household]));

  const perNightItems = data.costItems.filter((item) => item.distributionType === "per_night");
  const perStayItems = data.costItems.filter((item) => item.distributionType === "per_stay_person");
  const headcountItems = data.costItems.filter((item) => item.distributionType === "headcount");
  const directHouseholdItems = data.costItems.filter(
    (item) => item.distributionType === "direct_household",
  );
  const excludedItems = data.costItems.filter((item) => item.distributionType === "excluded");

  const perNightDivisor = money(
    data.participants.reduce(
      (sum, participant) => sum + (participant.countInNightDistribution ? participant.nights : 0),
      0,
    ),
  );
  const perStayDivisor = money(
    data.participants.filter((participant) => participant.countInStayCosts).length,
  );
  const headcountDivisor = money(
    data.participants.filter((participant) => participant.countInHeadcountCosts).length,
  );

  const perNight = buildSummary(sumCosts(perNightItems), perNightDivisor);
  const perStayPerson = buildSummary(sumCosts(perStayItems), perStayDivisor);
  const headcount = buildSummary(sumCosts(headcountItems), headcountDivisor);

  if (perNight.total.gt(0) && perNight.divisor.eq(0)) {
    warnings.push({
      code: "zero-per-night-divisor",
      level: "warning",
      message: copy.calculation.noCountedNights,
    });
  }

  if (perStayPerson.total.gt(0) && perStayPerson.divisor.eq(0)) {
    warnings.push({
      code: "zero-per-stay-divisor",
      level: "warning",
      message: copy.calculation.noCountedStayParticipants,
    });
  }

  if (headcount.total.gt(0) && headcount.divisor.eq(0)) {
    warnings.push({
      code: "zero-headcount-divisor",
      level: "warning",
      message: copy.calculation.noCountedParticipants,
    });
  }

  const participantBreakdowns: ParticipantBreakdown[] = data.participants.map((participant) => {
    const perNightBreakdown = participant.countInNightDistribution
      ? distributePerParticipant(participant, perNightItems, perNight.divisor, participant.nights)
      : { total: ZERO, costItems: [] as CostItemBreakdown[] };

    const perStayBreakdown = participant.countInStayCosts
      ? distributePerParticipant(participant, perStayItems, perStayPerson.divisor, 1)
      : { total: ZERO, costItems: [] as CostItemBreakdown[] };

    const headcountBreakdown = participant.countInHeadcountCosts
      ? distributePerParticipant(participant, headcountItems, headcount.divisor, 1)
      : { total: ZERO, costItems: [] as CostItemBreakdown[] };

    const total = perNightBreakdown.total
      .plus(perStayBreakdown.total)
      .plus(headcountBreakdown.total);

    return {
      participantId: participant.id,
      participantName: participant.name,
      householdId: getBillingGroupId(participant),
      householdName: participant.householdId
        ? (householdsById.get(participant.householdId)?.name ?? copy.common.unknownHousehold)
        : participant.name || copy.common.unknownHousehold,
      nights: participant.nights,
      perNightTotal: perNightBreakdown.total,
      stayTotal: perStayBreakdown.total,
      headcountTotal: headcountBreakdown.total,
      total,
      costItems: [
        ...perNightBreakdown.costItems,
        ...perStayBreakdown.costItems,
        ...headcountBreakdown.costItems,
      ],
    };
  });

  const directItemsWithHouseholds = directHouseholdItems.map((item) => ({
    costItemId: item.id,
    label: item.label,
    exactAmount: money(item.amount),
    householdId: item.assignedHouseholdId,
    householdName: item.assignedHouseholdId
      ? householdsById.get(item.assignedHouseholdId)?.name
      : undefined,
  }));

  const exactHouseholdTotals: HouseholdTotal[] = [
    ...data.households.map((household) => {
      const participantSubtotal = participantBreakdowns
        .filter((entry) => entry.householdId === household.id)
        .reduce((sum, entry) => sum.plus(entry.total), ZERO);

      const directCostsSubtotal = directItemsWithHouseholds
        .filter((entry) => entry.householdId === household.id)
        .reduce((sum, entry) => sum.plus(entry.exactAmount), ZERO);

      return {
        householdId: household.id,
        householdName: household.name,
        participantSubtotal,
        directCostsSubtotal,
        exactTotal: participantSubtotal.plus(directCostsSubtotal),
        roundedDisplayTotal: ZERO,
        roundingAdjustment: ZERO,
      };
    }),
    ...data.participants
      .filter((participant) => !participant.householdId)
      .map((participant) => {
        const participantBreakdown = participantBreakdowns.find(
          (entry) => entry.participantId === participant.id,
        );
        const participantSubtotal = participantBreakdown?.total ?? ZERO;

        return {
          householdId: getBillingGroupId(participant),
          householdName: participant.name || copy.common.unknownHousehold,
          participantSubtotal,
          directCostsSubtotal: ZERO,
          exactTotal: participantSubtotal,
          roundedDisplayTotal: ZERO,
          roundingAdjustment: ZERO,
        };
      }),
  ];

  const roundedTotals = allocateRoundedCents(exactHouseholdTotals.map((entry) => entry.exactTotal));
  const householdTotals = exactHouseholdTotals.map((entry, index) => ({
    ...entry,
    roundedDisplayTotal: roundedTotals[index],
    roundingAdjustment: roundedTotals[index].minus(entry.exactTotal),
  }));

  const excludedCostsTotal = excludedItems.reduce((sum, item) => sum.plus(item.amount), ZERO);
  const totalCosts = data.costItems.reduce((sum, item) => sum.plus(item.amount), ZERO);
  const includedCostsTotal = totalCosts.minus(excludedCostsTotal);
  const directHouseholdCostsTotal = directItemsWithHouseholds.reduce(
    (sum, item) => sum.plus(item.exactAmount),
    ZERO,
  );
  const participantTotal = participantBreakdowns.reduce((sum, item) => sum.plus(item.total), ZERO);
  const householdDisplayTotal = householdTotals.reduce(
    (sum, item) => sum.plus(item.roundedDisplayTotal),
    ZERO,
  );
  const exactAllocatedTotal = participantTotal.plus(directHouseholdCostsTotal);
  const householdRoundingDifference = householdDisplayTotal.minus(exactAllocatedTotal);

  return {
    totalCosts,
    includedCostsTotal,
    excludedCostsTotal,
    directHouseholdCostsTotal,
    perNight,
    perStayPerson,
    headcount,
    participantBreakdowns,
    householdTotals,
    directHouseholdItems: directItemsWithHouseholds,
    excludedItems: excludedItems.map((item) => ({
      costItemId: item.id,
      label: item.label,
      exactAmount: money(item.amount),
    })),
    warnings,
    controlDifference: includedCostsTotal.minus(exactAllocatedTotal),
    householdRoundingDifference,
  };
}
