export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR'

const localeMap: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  PKR: 'en-PK',
}

export function normalizeCurrencyCode(input?: string): CurrencyCode {
  const match = input?.trim().match(/^(USD|EUR|GBP|PKR)/i)
  return (match ? match[1].toUpperCase() : 'USD') as CurrencyCode
}

export function formatCurrency(value: number, currencyInput?: string, fractionDigits = 2): string {
  const currency = normalizeCurrencyCode(currencyInput)
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
