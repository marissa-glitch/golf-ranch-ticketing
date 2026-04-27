/** Format cents to a dollar string: 7000 → "$70" */
export function formatPrice(cents: number): string {
  if (cents % 100 === 0) {
    return `$${cents / 100}`
  }
  return `$${(cents / 100).toFixed(2)}`
}

/** Format a date string (YYYY-MM-DD) to "Saturday, June 27, 2026" */
export function formatDate(dateStr: string): string {
  // Parse as local date to avoid UTC offset shifting the day
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Format a date string to short form: "June 27, 2026" */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Generate a short random invite code */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/** Apply a promo discount to a price in cents */
export function applyDiscount(
  priceCents: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round(priceCents * (1 - discountValue / 100))
  }
  return Math.max(0, priceCents - discountValue)
}

/** Calculate discount amount in cents */
export function calcDiscount(
  priceCents: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round(priceCents * (discountValue / 100))
  }
  return Math.min(priceCents, discountValue)
}
