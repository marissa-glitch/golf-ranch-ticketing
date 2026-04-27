'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventCard from '@/components/EventCard'
import { EventWithSpots, TicketTier } from '@/lib/types'

interface Props {
  events: EventWithSpots[]
  tiersByEvent: Record<string, TicketTier[]>
}

const LOCATIONS = [
  { value: '', label: 'All Locations' },
  { value: 'brookfield', label: 'Brookfield, CT' },
  { value: 'glendale', label: 'Glendale, AZ' },
  { value: 'grand-prairie', label: 'Grand Prairie, TX' },
  { value: 'lees-summit', label: "Lee's Summit, MO" },
  { value: 'richardson', label: 'Richardson, TX' },
  { value: 'shoal-creek', label: 'Shoal Creek, MO' },
]

export default function HomepageClient({ events, tiersByEvent }: Props) {
  const [selectedLocation, setSelectedLocation] = useState('')

  const filtered = selectedLocation
    ? events.filter((e) => e.location_id === selectedLocation)
    : events

  const countLabel = selectedLocation
    ? `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'} in ${
        LOCATIONS.find((l) => l.value === selectedLocation)?.label ?? selectedLocation
      }`
    : `${filtered.length} events`

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Hero */}
      <section className="relative bg-[#00505b] px-4 py-24 text-center overflow-hidden">
        <Image
          src="/images/hero-main.jpg"
          alt="Golf Ranch Classic"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00505b]/75" />
        <div className="relative z-10">
          <p className="text-[#dab806] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Events &amp; Competitions
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            Golf Ranch Classic
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            4-man scramble tournaments at Golf Ranch locations nationwide. All skill levels welcome.
          </p>
        </div>
      </section>

      {/* Filter + Count */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-[#525252] font-medium">{countLabel}</p>

          {/* Location dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none w-full sm:w-auto bg-white border border-[#e9e9da] rounded-lg pl-4 pr-10 py-3 text-base font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#00505b] cursor-pointer"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
            {/* Chevron */}
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5l4 4 4-4"
                  stroke="#525252"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Event grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#525252] py-16">No events found for this location.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                tiers={tiersByEvent[event.id] ?? []}
                cardImage={`/images/card-${(i % 6) + 1}.jpg`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
