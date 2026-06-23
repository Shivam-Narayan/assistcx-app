export interface CurrencyOption {
  value: string;
  description: string;
}

export const DEFAULT_CURRENCY_SYMBOL = "$";

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: "$", description: "US Dollar (USD)" },
  { value: "€", description: "Euro (EUR)" },
  { value: "£", description: "British Pound (GBP)" },
  { value: "¥", description: "Japanese Yen (JPY)" },
  { value: "₹", description: "Indian Rupee (INR)" },
  { value: "A$", description: "Australian Dollar (AUD)" },
  { value: "C$", description: "Canadian Dollar (CAD)" },
  { value: "CHF", description: "Swiss Franc (CHF)" },
];

const currencyValues = new Set(CURRENCY_OPTIONS.map((option) => option.value));

export function isKnownCurrencySymbol(value: string): boolean {
  return currencyValues.has(value);
}

export function normalizeCurrencySymbol(value?: string | null): string {
  if (value && isKnownCurrencySymbol(value)) {
    return value;
  }
  return DEFAULT_CURRENCY_SYMBOL;
}
