import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { generateInviteCode } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const UPSELL_PRICE = 5000 // cents

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventSlug,
      tierId,
      customerName,
      customerEmail,
      customerPhone,
      teamName,
      ranchPassCode,
      upsellAdded,
      shippingAddress,
      promoCodeId,
      discountCents,
      existingTeamId,
      waitlistToken,
    } = body

    const supabase = createServerClient()

    // Fetch event + tier
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('slug', eventSlug)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { data: tier } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('id', tierId)
      .single()

    if (!tier) return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })

    // Calculate amounts
    const basePrice = tier.price
    const ticketAmount = Math.max(0, basePrice - (discountCents ?? 0))
    const upsellAmount = upsellAdded ? UPSELL_PRICE : 0
    const totalAmount = ticketAmount + upsellAmount

    // Use existing team (teammate joining via invite) or create new one
    let teamId: string | null = existingTeamId ?? null
    if (!teamId && tier.is_team && teamName) {
      const { data: newTeam } = await supabase
        .from('teams')
        .insert({
          event_id: event.id,
          team_name: teamName,
          invite_code: generateInviteCode(),
          ticket_tier_id: tier.id,
        })
        .select()
        .single()
      teamId = newTeam?.id ?? null
    }

    // Create pending order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        event_id: event.id,
        ticket_tier_id: tier.id,
        team_id: teamId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        ranch_pass_code: ranchPassCode || null,
        pay_amount: totalAmount,
        discount: discountCents ?? 0,
        promo_code_id: promoCodeId || null,
        upsell_added: upsellAdded ?? false,
        upsell_amount: upsellAmount,
        shipping_address: upsellAdded && shippingAddress ? shippingAddress : null,
        status: 'pending',
      })
      .select()
      .single()

    if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams['line_items'] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tier.name,
            description: `${event.name} — ${event.location_name}, ${event.location_state}`,
          },
          unit_amount: ticketAmount,
        },
        quantity: 1,
      },
    ]

    if (upsellAdded) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: '4-Pack Classic Bucket Hats',
            description: 'Limited-edition Golf Ranch Classic bucket hats (set of 4)',
          },
          unit_amount: UPSELL_PRICE,
        },
        quantity: 1,
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${baseUrl}/events/${eventSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${eventSlug}/checkout?tier=${tierId}`,
      metadata: {
        order_id: order.id,
        event_id: event.id,
        team_id: teamId ?? '',
        promo_code_id: promoCodeId ?? '',
        waitlist_token: waitlistToken ?? '',
      },
    })

    // Save session ID to order
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
