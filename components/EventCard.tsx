import Link from 'next/link'
import Image from 'next/image'
import ImagePlaceholder from './ImagePlaceholder'
import { EventWithSpots, TicketTier } from '@/lib/types'
import { formatDateShort, formatPrice } from '@/lib/utils'

interface EventCardProps {
  event: EventWithSpots
  tiers: TicketTier[]
  cardImage?: string
}

export default function EventCard({ event, tiers, cardImage }: EventCardProps) {
  const isSoldOut = event.status === 'soldout' || event.spots_remaining <= 0
  const isLowSpots = !isSoldOut && event.spots_remaining <= 20

  const prices = tiers.map((t) => t.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const priceRange =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`

  const card = (
    <div
      className={`group relative rounded-xl overflow-hidden border border-[#e9e9da] bg-white transition-all duration-200 ${
        isSoldOut ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-lg cursor-pointer'
      }`}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden">
        {cardImage ? (
          <Image
            src={cardImage}
            alt={`${event.name} — ${event.location_name}`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}

        {/* Badges */}
        {isSoldOut && (
          <span className="absolute top-3 left-3 bg-[#733104] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10">
            Sold Out
          </span>
        )}
        {!isSoldOut && (
          <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10 ${
            isLowSpots ? 'bg-[#c77112]' : 'bg-black/50'
          }`}>
            {event.spots_remaining} spots left
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs font-semibold text-[#00505b] uppercase tracking-widest mb-1">
          {event.location_name}, {event.location_state}
        </p>
        <h3 className="text-lg font-bold text-[#171717] leading-tight mb-1">{event.name}</h3>
        <p className="text-sm text-[#525252] mb-0.5">{formatDateShort(event.date)}</p>
        {event.start_time && event.end_time && (
          <p className="text-sm text-[#525252] mb-3">
            {event.start_time} – {event.end_time}
          </p>
        )}
        <p className="text-sm font-medium text-[#171717] mb-4">{priceRange}</p>

        {isSoldOut ? (
          <div className="w-full text-center bg-[#e9e9da] text-[#525252] font-bold py-2.5 rounded-lg text-sm uppercase tracking-wide">
            Sold Out
          </div>
        ) : (
          <div className="w-full text-center bg-[#dab806] text-[#003d45] font-bold py-2.5 rounded-lg text-sm uppercase tracking-wide group-hover:bg-[#c9a905] transition-colors">
            Get Tickets
          </div>
        )}
      </div>
    </div>
  )

  if (isSoldOut) return card

  return <Link href={`/events/${event.slug}`}>{card}</Link>
}
