'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Event, Order, Team, TicketTier } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  event: Event
  order: Order
  tier: TicketTier
  team: Team | null
}

export default function ConfirmationClient({ event, order, tier, team }: Props) {
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const inviteLink = team ? `${baseUrl}/join/${team.invite_code}` : null

  function copyLink() {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Hero */}
      <section className="bg-[#00505b] px-4 py-16 text-center">
        <div className="text-5xl mb-4">⛳</div>
        <p className="text-[#dab806] font-black uppercase tracking-[0.15em] text-xl mb-2">
          YOU&apos;RE IN!
        </p>
        <p className="text-white/80 text-sm">
          Confirmation sent to {order.customer_email}
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Order details */}
        <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
          <h2 className="font-bold text-[#171717] mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#525252]">Order #</span>
              <span className="font-mono text-xs text-[#171717]">{order.id.split('-')[0].toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525252]">Event</span>
              <span className="font-medium text-[#171717]">{event.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525252]">Location</span>
              <span className="font-medium text-[#171717]">{event.location_name}, {event.location_state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525252]">Date</span>
              <span className="font-medium text-[#171717]">{formatDate(event.date)}</span>
            </div>
            {event.start_time && (
              <div className="flex justify-between">
                <span className="text-[#525252]">Time</span>
                <span className="font-medium text-[#171717]">{event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#525252]">Ticket</span>
              <span className="font-medium text-[#171717]">{tier.name}</span>
            </div>
            {team && (
              <div className="flex justify-between">
                <span className="text-[#525252]">Team</span>
                <span className="font-medium text-[#171717]">{team.team_name}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#e9e9da]">
              <span className="font-bold text-[#171717]">Amount Paid</span>
              <span className="font-bold text-[#171717]">{formatPrice(order.pay_amount)}</span>
            </div>
          </div>
        </div>

        {/* What to Know */}
        <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
          <h2 className="font-bold text-[#171717] mb-3">What to Know</h2>
          <p className="text-sm text-[#525252] leading-relaxed">
            Show up ready to swing. No dress code. Range balls, bucket hat, and lunch included.
            Bring your own clubs or use ours. Competition kicks off at 8 AM.
          </p>
        </div>

        <Link
          href="/"
          className="block w-full text-center bg-[#00505b] text-white font-bold uppercase tracking-wide py-3.5 rounded-xl hover:bg-[#003d45] transition-colors"
        >
          Back to Events
        </Link>
      </div>
    </div>
  )
}
