'use client'

import { useState } from 'react'
import { TicketTier } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface Props {
  eventId: string
  tiers: TicketTier[]
}

export default function WaitlistForm({ eventId, tiers }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function toggleTier(id: string) {
    setSelectedTierIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedTierIds.length === 0) {
      setError('Please select at least one ticket type.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          ticketTierIds: selectedTierIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00505b]/10 mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#00505b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-bold text-[#171717] mb-1">You&apos;re on the waitlist!</p>
        <p className="text-sm text-[#525252]">
          We&apos;ll email <strong>{email}</strong> if a spot opens. You&apos;ll have 48 hours to
          claim it.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-5">
        <span className="inline-block bg-[#733104] text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide mb-3">
          Sold Out
        </span>
        <p className="text-[#525252] text-sm">
          Join the waitlist and we&apos;ll notify you if a spot opens up. You&apos;ll have 48 hours
          to claim it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">
            Name <span className="text-[#733104]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
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
            required
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

        <div>
          <p className="text-sm font-medium text-[#171717] mb-2">
            Ticket type <span className="text-[#733104]">*</span>
          </p>
          <div className="space-y-2">
            {tiers.map((tier) => (
              <label
                key={tier.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTierIds.includes(tier.id)
                    ? 'border-[#00505b] bg-[#00505b]/5'
                    : 'border-[#e9e9da] hover:border-[#00505b]/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTierIds.includes(tier.id)}
                  onChange={() => toggleTier(tier.id)}
                  className="w-4 h-4 accent-[#00505b] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#171717]">{tier.name}</p>
                  <p className="text-xs text-[#525252]">
                    {formatPrice(tier.price)}
                    {tier.per_player ? ` (${formatPrice(tier.per_player)}/player)` : ''}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[#733104]">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !name.trim() || !email.trim()}
          className="w-full bg-[#00505b] text-white font-bold py-3 rounded-lg hover:bg-[#003d45] transition-colors disabled:opacity-50 uppercase tracking-wide"
        >
          {submitting ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  )
}
