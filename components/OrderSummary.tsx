import { TicketTier, Event } from '@/lib/types'
import { formatPrice, formatDateShort } from '@/lib/utils'

interface OrderSummaryProps {
  event: Event
  tier: TicketTier
  upsellAdded: boolean
  discountCents: number
  promoCode?: string
}

const UPSELL_PRICE = 5000 // $50

export default function OrderSummary({
  event,
  tier,
  upsellAdded,
  discountCents,
  promoCode,
}: OrderSummaryProps) {
  const basePrice = tier.price
  const upsell = upsellAdded ? UPSELL_PRICE : 0
  const total = Math.max(0, basePrice - discountCents) + upsell

  const ticketLabel = tier.is_team ? 'Ticket (full team)' : 'Ticket'

  return (
    <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
      <h3 className="font-bold text-[#171717] mb-3">Order Summary</h3>

      <div className="text-sm text-[#525252] mb-3 pb-3 border-b border-[#e9e9da]">
        <p className="font-medium text-[#171717]">{event.name}</p>
        <p>
          {event.location_name}, {event.location_state}
        </p>
        <p>{formatDateShort(event.date)}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#525252]">{ticketLabel}</span>
          <span className="font-medium">{formatPrice(basePrice)}</span>
        </div>

        {upsellAdded && (
          <div className="flex justify-between">
            <span className="text-[#525252]">4-Pack Bucket Hats</span>
            <span className="font-medium">{formatPrice(UPSELL_PRICE)}</span>
          </div>
        )}

        {discountCents > 0 && (
          <div className="flex justify-between text-green-700">
            <span>
              Promo{promoCode ? ` (${promoCode})` : ''}
            </span>
            <span>−{formatPrice(discountCents)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-base pt-2 border-t border-[#e9e9da]">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
