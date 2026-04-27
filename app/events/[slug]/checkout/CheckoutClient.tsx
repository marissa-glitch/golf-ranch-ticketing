'use client'

import { useState } from 'react'
import Link from 'next/link'
import OrderSummary from '@/components/OrderSummary'
import { Event, TicketTier, PromoCode, ShippingAddress } from '@/lib/types'
import { formatPrice, calcDiscount } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Props {
  event: Event
  tiers: TicketTier[]
  initialTier: TicketTier | null
  waitlistToken: string | null
}

const UPSELL_PRICE = 5000

export default function CheckoutClient({ event, tiers, initialTier, waitlistToken }: Props) {
  const [tier, setTier] = useState<TicketTier | null>(initialTier)
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [teamName, setTeamName] = useState('')
  const [ranchPassCode, setRanchPassCode] = useState('')

  // Upsell
  const [upsellAdded, setUpsellAdded] = useState(false)
  const [shipping, setShipping] = useState<ShippingAddress>({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  })

  // Promo
  const [promoInput, setPromoInput] = useState('')
  const [promoData, setPromoData] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const isTeam = tier?.is_team ?? false
  const isRanchPass = tier?.is_ranch_pass ?? false

  const basePrice = tier?.price ?? 0
  const discountCents = promoData ? calcDiscount(basePrice, promoData.discount_type, promoData.discount_value) : 0

  async function applyPromo() {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoData(null)

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoInput.trim().toUpperCase())
      .eq('active', true)
      .single()

    if (error || !data) {
      setPromoError('Code not found or no longer active.')
    } else if (data.max_uses && data.used_count >= data.max_uses) {
      setPromoError('This code has reached its usage limit.')
    } else if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setPromoError('This code has expired.')
    } else if (data.event_id && data.event_id !== event.id) {
      setPromoError('This code is not valid for this event.')
    } else {
      setPromoData(data as PromoCode)
    }
    setPromoLoading(false)
  }

  async function handlePay() {
    if (!tier) return
    if (!name.trim() || !email.trim()) {
      alert('Please fill in your name and email.')
      return
    }
    if (isTeam && !teamName.trim()) {
      alert('Please enter a team name.')
      return
    }
    if (isRanchPass && !ranchPassCode.trim()) {
      alert('Please enter your Ranch Pass code.')
      return
    }
    if (upsellAdded && (!shipping.address1 || !shipping.city || !shipping.state || !shipping.zip)) {
      alert('Please complete the shipping address for your hats.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: event.slug,
          tierId: tier.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          teamName,
          ranchPassCode,
          upsellAdded,
          shippingAddress: upsellAdded ? shipping : null,
          promoCodeId: promoData?.id ?? null,
          discountCents,
          waitlistToken,
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

  const total = Math.max(0, basePrice - discountCents) + (upsellAdded ? UPSELL_PRICE : 0)

  if (!tier) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#525252] mb-4">No ticket tier selected.</p>
          <Link href={`/events/${event.slug}`} className="text-[#00505b] font-medium hover:underline">
            ← Back to event
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Header */}
      <header className="bg-[#00505b] px-4 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href={`/events/${event.slug}`}
            className="text-white/70 hover:text-white transition-colors -ml-2 p-2 rounded-lg"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 15L8 10l4-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-white font-black uppercase tracking-wide text-lg">Checkout</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Order summary */}
        <OrderSummary
          event={event}
          tier={tier}
          upsellAdded={upsellAdded}
          discountCents={discountCents}
          promoCode={promoData?.code}
        />

        {/* Your Info */}
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
            {isTeam && (
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  Team Name <span className="text-[#733104]">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Your team name"
                  className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ranch Pass Verification */}
        {isRanchPass && (
          <div className="bg-white rounded-xl border-2 border-[#dab806] p-5">
            <h2 className="font-bold text-[#171717] mb-1">Ranch Pass Verification</h2>
            <p className="text-sm text-[#525252] mb-4">
              Found on your membership card or confirmation email.
            </p>
            <label className="block text-sm font-medium text-[#171717] mb-1">
              Ranch Pass Code <span className="text-[#733104]">*</span>
            </label>
            <input
              type="text"
              value={ranchPassCode}
              onChange={(e) => setRanchPassCode(e.target.value)}
              placeholder="e.g. RP-XXXX-XXXX"
              className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#dab806]"
            />
          </div>
        )}

        {/* Upsell */}
        <div
          className="bg-white rounded-xl border-2 border-dashed border-[#c77112] p-5 cursor-pointer"
          onClick={() => setUpsellAdded(!upsellAdded)}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={upsellAdded}
              onChange={() => setUpsellAdded(!upsellAdded)}
              className="mt-1 w-4 h-4 accent-[#c77112] flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-[#171717]">4-Pack Classic Bucket Hats</span>
                <span className="text-xs font-semibold bg-[#c77112] text-white px-2 py-0.5 rounded-full">
                  Add-On
                </span>
              </div>
              <p className="text-sm text-[#525252] mb-1">
                <strong>$50</strong> ($12.50/hat — retail $20)
              </p>
              <p className="text-sm text-[#525252]">
                Match the squad. Grab 4 limited-edition Golf Ranch Classic bucket hats — one for
                each teammate. Only available during checkout.
              </p>
            </div>
          </div>

          {/* Shipping form */}
          {upsellAdded && (
            <div
              className="mt-4 pt-4 border-t border-[#e9e9da] space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium text-[#171717]">
                We&apos;ll ship your hats before event day.
              </p>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1">
                  Street Address <span className="text-[#733104]">*</span>
                </label>
                <input
                  type="text"
                  value={shipping.address1}
                  onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                  placeholder="123 Main St"
                  className="w-full border border-[#e9e9da] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1">Apt / Suite</label>
                <input
                  type="text"
                  value={shipping.address2}
                  onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                  placeholder="Optional"
                  className="w-full border border-[#e9e9da] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#525252] mb-1">
                    City <span className="text-[#733104]">*</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full border border-[#e9e9da] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-[#525252] mb-1">
                    State <span className="text-[#733104]">*</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    maxLength={2}
                    placeholder="TX"
                    className="w-full border border-[#e9e9da] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00505b] uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1">
                  ZIP <span className="text-[#733104]">*</span>
                </label>
                <input
                  type="text"
                  value={shipping.zip}
                  onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                  maxLength={10}
                  placeholder="75001"
                  className="w-full border border-[#e9e9da] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Promo code — only for non-Ranch Pass tiers */}
        {!isRanchPass && (
          <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
            <h2 className="font-bold text-[#171717] mb-3">Promo Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                placeholder="Enter code"
                className="flex-1 border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b] uppercase"
              />
              <button
                onClick={applyPromo}
                disabled={promoLoading}
                className="bg-[#00505b] text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-[#003d45] transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-sm text-[#733104] mt-2">{promoError}</p>}
            {promoData && (
              <p className="text-sm text-green-700 mt-2 font-medium">
                ✓ Code applied —{' '}
                {promoData.discount_type === 'percentage'
                  ? `${promoData.discount_value}% off`
                  : `${formatPrice(promoData.discount_value)} off`}
              </p>
            )}
          </div>
        )}

        {/* Pay button */}
        <div>
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-[#dab806] text-[#003d45] font-black uppercase tracking-wide text-lg py-4 rounded-xl hover:bg-[#c9a905] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Redirecting to checkout...' : `PAY ${formatPrice(total)}`}
          </button>
          <p className="text-center text-xs text-[#525252] mt-2">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
