'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Event, Team, TicketTier } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  team: Team
  event: Event
  tier: TicketTier | null
}

export default function TeamJoinClient({ team, event, tier }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [ranchPassCode, setRanchPassCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const perPlayerPrice = tier?.per_player ?? tier?.price ?? 0
  const isRanchPass = tier?.is_ranch_pass ?? false

  async function handlePay() {
    if (!name.trim() || !email.trim()) {
      alert('Please fill in your name and email.')
      return
    }
    if (isRanchPass && !ranchPassCode.trim()) {
      alert('Please enter your Ranch Pass code.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: event.slug,
          tierId: tier?.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          teamName: team.team_name,
          ranchPassCode,
          splitPay: true,
          upsellAdded: false,
          shippingAddress: null,
          promoCodeId: null,
          discountCents: 0,
          existingTeamId: team.id,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        alert(data.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Hero */}
      <section className="bg-[#00505b] px-4 py-14 text-center">
        <p className="text-[#dab806] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          You&apos;ve Been Invited
        </p>
        <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
          Join {team.team_name}
        </h1>
        <p className="text-white/80 text-sm">
          {event.location_name}, {event.location_state} · {formatDate(event.date)}
        </p>
        {event.start_time && event.end_time && (
          <p className="text-white/70 text-sm">
            {event.start_time} – {event.end_time}
          </p>
        )}
      </section>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Per-player price info */}
        {tier && (
          <div className="bg-white rounded-xl border border-[#e9e9da] p-5 text-center">
            <p className="text-[#525252] text-sm mb-1">Your share</p>
            <p className="text-3xl font-black text-[#171717]">{formatPrice(perPlayerPrice)}</p>
            <p className="text-[#525252] text-sm mt-1">per player · {tier.name}</p>
          </div>
        )}

        {/* Join form */}
        <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
          <h2 className="font-bold text-[#171717] mb-4">Your Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">
                Name <span className="text-[#733104]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">
                Email <span className="text-[#733104]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
              />
            </div>

            {isRanchPass && (
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  Ranch Pass Code <span className="text-[#733104]">*</span>
                </label>
                <input
                  type="text"
                  value={ranchPassCode}
                  onChange={(e) => setRanchPassCode(e.target.value)}
                  placeholder="e.g. RP-XXXX-XXXX"
                  className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-[#dab806] text-[#003d45] font-black uppercase tracking-wide text-lg py-4 rounded-xl hover:bg-[#c9a905] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Redirecting to checkout...' : `PAY ${formatPrice(perPlayerPrice)}`}
          </button>
          <p className="text-center text-xs text-[#525252] mt-2">
            Secure checkout powered by Stripe
          </p>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-[#525252] hover:text-[#00505b] transition-colors"
        >
          View all events
        </Link>
      </div>
    </div>
  )
}
