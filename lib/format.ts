/**
 * Format DB values for display (price, address label, etc.)
 */

/** Format numeric price as Nigerian Naira string (e.g. 3500 → "3,500") */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(price)
}

/** Short label for address (area, street, house_number) for header */
export function addressShortLabel(area: string, street: string, houseNumber: string, maxLength = 32): string {
  const raw = [houseNumber, street, area].filter(Boolean).join(", ")
  return raw.length <= maxLength ? raw : `${raw.slice(0, maxLength - 3)}...`
}
