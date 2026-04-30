import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { notifyNext, convertWaitlistEntry } from '@/lib/waitlist'
import { sendConfirmationEmail } from '@/lib/resend'
import { upsertHubSpotContact } from '@/lib/hubspot'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

// Must disable body parsing so we can verify Stripe signature
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { order_id, promo_code_id, waitlist_token } = session.metadata ?? {}

    console.log('checkout.session.completed — order_id:', order_id)

    if (!order_id) return NextResponse.json({ ok: true })

    // Mark order as completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_id: session.payment_intent as string,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (updateError) console.error('Order update failed:', updateError)

    // Increment promo code usage
    if (promo_code_id) {
      await supabase.rpc('increment_promo_usage', { promo_id: promo_code_id })
    }

    // Mark waitlist entry as converted if this came from a waitlist invite
    if (waitlist_token) {
      await convertWaitlistEntry(waitlist_token)
    }

    // Fetch full order data for email + HubSpot
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, event:events(*), tier:ticket_tiers(*), team:teams(*)')
      .eq('id', order_id)
      .single()

    if (fullOrder?.event && fullOrder?.tier) {
      const nameParts = fullOrder.customer_name.trim().split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''
      const inviteLink = fullOrder.team?.invite_code
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/join/${fullOrder.team.invite_code}`
        : null

      await Promise.all([
        sendConfirmationEmail({
          order: fullOrder,
          event: fullOrder.event,
          tier: fullOrder.tier,
          inviteLink,
        }),
        upsertHubSpotContact({
          email: fullOrder.customer_email,
          firstName,
          lastName,
          phone: fullOrder.customer_phone,
          locationName: fullOrder.event.location_name,
        }),
      ])
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    if (!charge.payment_intent) return NextResponse.json({ ok: true })

    const { data: order } = await supabase
      .from('orders')
      .select('id, event_id')
      .eq('stripe_payment_id', charge.payment_intent as string)
      .single()

    if (!order) return NextResponse.json({ ok: true })

    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', order.id)

    // Offer the freed spot to the next person on the waitlist
    await notifyNext(order.event_id)
  }

  return NextResponse.json({ ok: true })
}
