export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Event, TicketTier } from '@/lib/types'
import EventDetailClient from './EventDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', event.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  return <EventDetailClient event={event as Event} tiers={(tiers ?? []) as TicketTier[]} />
}
