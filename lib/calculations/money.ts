import Decimal from "decimal.js";
import { getIntlLocale, type Locale } from "@/lib/i18n";

Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

export const ZERO = new Decimal(0);

export function money(value: Decimal.Value) {
  return new Decimal(value);
}

export function euro(value: Decimal.Value, locale: Locale = "nl") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: "EUR",
  }).format(money(value).toNumber());
}

export function decimalToDisplay(value: Decimal.Value) {
  return money(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function decimalInputToNumber(raw: string) {
  const normalized = raw.replace(",", ".").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function formatExact(value: Decimal.Value) {
  return `${money(value).toFixed(4)} EUR`;
}

export function toRoundedCents(value: Decimal.Value) {
  return money(value).times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

export function allocateRoundedCents(values: Decimal[]) {
  const floors = values.map((value, index) => {
    const scaled = value.times(100);
    const floor = scaled.floor();

    return {
      index,
      floor,
      remainder: scaled.minus(floor),
    };
  });

  const floorSum = floors.reduce((sum, item) => sum.plus(item.floor), ZERO);
  const target = values
    .reduce((sum, value) => sum.plus(value), ZERO)
    .times(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  let centsToDistribute = target.minus(floorSum).toNumber();
  const sorted = [...floors].sort((a, b) => b.remainder.comparedTo(a.remainder));
  const allocated = floors.map((item) => item.floor);

  for (const item of sorted) {
    if (centsToDistribute <= 0) break;
    allocated[item.index] = allocated[item.index].plus(1);
    centsToDistribute -= 1;
  }

  return allocated.map((value) => value.div(100));
}
