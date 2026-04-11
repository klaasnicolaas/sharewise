import type { CalculationResult, ProjectData } from "@/lib/calculations/types";
import { decimalToDisplay, euro } from "@/lib/calculations/money";
import { formatSelectorMessage, translations, type Locale } from "@/lib/i18n";

export function buildProjectExplanation(data: ProjectData, locale: Locale = "nl") {
  const copy = translations[locale];
  const lines: string[] = [];
  const julian = data.participants.find((participant) => participant.name === "Julian");

  if (
    julian &&
    julian.countInNightDistribution &&
    !julian.countInStayCosts &&
    !julian.countInHeadcountCosts
  ) {
    lines.push(copy.selectors.julianExplanation);
  }

  for (const item of data.costItems.filter(
    (costItem) => costItem.distributionType === "direct_household",
  )) {
    const household = data.households.find((entry) => entry.id === item.assignedHouseholdId);
    if (household) {
      lines.push(
        formatSelectorMessage(locale, "directHouseholdExplanation", {
          label: item.label,
          household: household.name,
        }),
      );
    }
  }

  for (const household of data.households) {
    const members = data.participants.filter(
      (participant) => participant.householdId === household.id,
    );
    if (members.length > 1) {
      lines.push(
        formatSelectorMessage(locale, "sharedHouseholdExplanation", { household: household.name }),
      );
    }
  }

  return Array.from(new Set(lines));
}

export function buildGroupSummary(result: CalculationResult, locale: Locale = "nl") {
  const copy = translations[locale];
  const oneNight = result.participantBreakdowns.find((entry) => entry.nights === 1);
  const twoNights = result.participantBreakdowns.find((entry) => entry.nights === 2);
  const directExtras = result.directHouseholdItems
    .filter((item) => item.householdName)
    .map((item) =>
      formatSelectorMessage(locale, "extraCosts", {
        household: item.householdName!,
        label: item.label,
        amount: euro(item.exactAmount, locale),
      }),
    );

  const lines = [
    oneNight
      ? formatSelectorMessage(locale, "oneNightRate", { amount: euro(oneNight.total, locale) })
      : null,
    twoNights
      ? formatSelectorMessage(locale, "twoNightRate", { amount: euro(twoNights.total, locale) })
      : null,
    ...directExtras,
    copy.selectors.dmSummary,
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildTikkieSummary(result: CalculationResult, locale: Locale = "nl") {
  return result.householdTotals
    .map((household) => {
      const rounded = euro(household.roundedDisplayTotal, locale);
      const adjustment = decimalToDisplay(household.roundingAdjustment);
      const rounding = adjustment.isZero()
        ? ""
        : formatSelectorMessage(locale, "tikkieRounding", { amount: euro(adjustment, locale) });
      return formatSelectorMessage(locale, "tikkieRow", {
        household: household.householdName,
        amount: rounded,
        rounding,
      }).trim();
    })
    .join("\n");
}

export function buildHouseholdBreakdown(
  result: CalculationResult,
  householdId: string,
  locale: Locale = "nl",
) {
  const copy = translations[locale];
  const ht = result.householdTotals.find((h) => h.householdId === householdId);
  if (!ht) return "";

  const members = result.participantBreakdowns.filter((pb) => pb.householdId === householdId);

  const lines: string[] = [
    `*${formatSelectorMessage(locale, "breakdownTitle", { household: ht.householdName })}*`,
    "",
  ];

  for (const m of members) {
    const nightLabel = m.nights === 1 ? copy.common.night : copy.common.nights;
    lines.push(
      formatSelectorMessage(locale, "nightsLabel", {
        name: m.participantName,
        count: String(m.nights),
        nightLabel,
      }),
    );
    for (const ci of m.costItems) {
      lines.push(`  • ${ci.label}: ${euro(ci.exactAmount, locale)}`);
    }
    lines.push(`  ${copy.common.subtotal}: ${euro(m.total, locale)}`);
    lines.push("");
  }

  // Direct household costs
  const directCosts = result.directHouseholdItems.filter((d) => d.householdId === householdId);
  if (directCosts.length > 0) {
    lines.push(`${copy.common.directCosts}:`);
    for (const d of directCosts) {
      lines.push(`  • ${d.label}: ${euro(d.exactAmount, locale)}`);
    }
    lines.push("");
  }

  lines.push(`*${copy.selectors.total}: ${euro(ht.roundedDisplayTotal, locale)}*`);

  if (!ht.roundingAdjustment.isZero()) {
    lines.push(
      formatSelectorMessage(locale, "roundingWithAmount", {
        amount: euro(ht.roundingAdjustment, locale),
      }),
    );
  }

  return lines.join("\n");
}
