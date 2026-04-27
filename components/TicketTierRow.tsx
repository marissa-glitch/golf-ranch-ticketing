'use client'

import { TicketTier } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface TicketTierRowProps {
  tier: TicketTier
  selected: boolean
  onSelect: () => void
}

export default function TicketTierRow({ tier, selected, onSelect }: TicketTierRowProps) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-[#00505b] bg-[#00505b]/5'
          : 'border-[#e9e9da] bg-white hover:border-[#00505b]/40'
      }`}
    >
      <input
        type="radio"
        name="ticket_tier"
        checked={selected}
        onChange={onSelect}
        className="mt-1 accent-[#00505b] w-5 h-5 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#171717]">{tier.name}</span>
              {tier.is_ranch_pass && (
                <span className="text-xs font-semibold bg-[#dab806] text-[#003d45] px-2 py-0.5 rounded-full">
                  Ranch Pass
                </span>
              )}
            </div>
            {tier.description && (
              <p className="text-sm text-[#525252] mt-0.5 leading-snug">{tier.description}</p>
            )}
          </div>

          <div className="text-right flex-shrink-0 pl-2">
            <div className="font-bold text-[#171717] text-base">{formatPrice(tier.price)}</div>
            {tier.is_team && tier.per_player ? (
              <div className="text-xs text-[#525252] whitespace-nowrap">
                {formatPrice(tier.per_player)}/player
              </div>
            ) : (
              <div className="text-xs text-[#525252]">/player</div>
            )}
          </div>
        </div>
      </div>
    </label>
  )
}
