'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TicketTierRow from '@/components/TicketTierRow'
import WaitlistForm from '@/components/WaitlistForm'
import { Event, TicketTier } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  event: Event
  tiers: TicketTier[]
}

const INCLUDED = [
  '4-man scramble tournament',
  '18 holes of virtual golf on Toptracer',
  'Limited-edition Classic bucket hat',
  'Free drink + food specials',
  'Swag bag',
  'Prizes & playoff for top teams',
  'Longest Drive & Closest to Pin competitions',
  'Open to all skill levels',
]

export default function EventDetailClient({ event, tiers }: Props) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const router = useRouter()

  const selectedTier = tiers.find((t) => t.id === selectedTierId) ?? null
  const isSoldOut = event.status === 'soldout'

  function handleContinue() {
    if (!selectedTierId) return
    router.push(`/events/${event.slug}/checkout?tier=${selectedTierId}`)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] pb-32">
      {/* Hero */}
      <section className="relative w-full h-72 md:h-[420px] bg-[#00505b]">
        <Image
          src="/images/event-hero.jpg"
          alt="Golf Ranch Classic"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        {/* Gradient: transparent at top, dark teal at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#002d33]/90 via-black/20 to-black/30" />

        {/* Back link — top left */}
        <div className="absolute top-5 left-4 right-4 max-w-3xl mx-auto z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All Events
          </Link>
        </div>

        {/* Event title — bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-7 pt-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#dab806] text-xs font-bold uppercase tracking-[0.2em] mb-2">
              {event.location_name}, {event.location_state}
            </p>
            <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight mb-1">
              {event.name}
            </h1>
            <p className="text-white/80 text-sm">{formatDate(event.date)}</p>
            {event.start_time && event.end_time && (
              <p className="text-white/80 text-sm">
                {event.start_time} – {event.end_time}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* What's Included */}
        <div className="bg-white rounded-xl border border-[#e9e9da] p-6">
          <h2 className="font-bold text-[#171717] text-lg mb-4">What&apos;s Included</h2>
          <ul className="space-y-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#525252]">
                <span className="text-[#00505b] mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Select Your Ticket */}
        <div className="bg-white rounded-xl border border-[#e9e9da] p-6">
          <h2 className="font-bold text-[#171717] text-lg mb-4">Select Your Ticket</h2>

          {isSoldOut ? (
            <WaitlistForm eventId={event.id} tiers={tiers} />
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => (
                <TicketTierRow
                  key={tier.id}
                  tier={tier}
                  selected={selectedTierId === tier.id}
                  onSelect={() => setSelectedTierId(tier.id)}
                />
              ))}

              <p className="text-sm text-[#525252] pt-2">
                Not a Ranch Pass member?{' '}
                <a
                  href="https://golfranch.com/ranch-pass"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00505b] font-medium hover:underline"
                >
                  Join for $20/mo →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {selectedTier && !isSoldOut && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e9e9da] shadow-lg px-4 py-4 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#171717]">{selectedTier.name}</p>
              <p className="text-sm text-[#525252]">{formatPrice(selectedTier.price)}</p>
            </div>
            <button
              onClick={handleContinue}
              className="bg-[#dab806] text-[#003d45] font-bold px-8 py-3.5 rounded-lg uppercase tracking-wide hover:bg-[#c9a905] transition-colors min-w-[140px] text-center"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
