import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { eventId, customerName, customerEmail, customerPhone, ticketTierIds } = await req.json()

    if (!eventId || !customerName?.trim() || !customerEmail?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    if (!Array.isArray(ticketTierIds) || ticketTierIds.length === 0) {
      return NextResponse.json({ error: 'Please select at least one ticket type.' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })

    // Prevent duplicates
    const { data: existing } = await supabase
      .from('waitlist_entries')
      .select('id')
      .eq('event_id', eventId)
      .eq('customer_email', customerEmail.trim().toLowerCase())
      .in('status', ['waiting', 'notified'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this event." },
        { status: 409 }
      )
    }

    await supabase.from('waitlist_entries').insert({
      event_id: eventId,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_phone: customerPhone?.trim() || null,
      ticket_tier_ids: ticketTierIds,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Waitlist join error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
