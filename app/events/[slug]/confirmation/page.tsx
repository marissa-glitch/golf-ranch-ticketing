export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Event, Order, Team, TicketTier } from '@/lib/types'
import ConfirmationClient from './ConfirmationClient'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session_id?: string; order?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { session_id, order: orderId } = await searchParams

  if (!session_id && !orderId) notFound()

  const supabase = createServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  // Look up order by Stripe session ID (primary) or order ID (fallback)
  const query = supabase.from('orders').select('*')
  const { data: order } = session_id
    ? await query.eq('stripe_session_id', session_id).single()
    : await query.eq('id', orderId!).single()

  if (!order) notFound()

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('id', order.ticket_tier_id)
    .single()

  let team: Team | null = null
  if (order.team_id) {
    const { data } = await supabase.from('teams').select('*').eq('id', order.team_id).single()
    team = data
  }

  return (
    <ConfirmationClient
      event={event as Event}
      order={order as Order}
      tier={tier as TicketTier}
      team={team}
    />
  )
}
