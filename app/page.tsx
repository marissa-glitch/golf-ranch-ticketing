export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase'
import { Event, TicketTier, EventWithSpots } from '@/lib/types'
import HomepageClient from './HomepageClient'

async function getSpots(
  eventId: string,
  capacity: number,
  supabase: ReturnType<typeof createServerClient>
): Promise<number> {
  const { count: individualCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'completed')
    .is('team_id', null)

  const { data: teamOrders } = await supabase
    .from('orders')
    .select('team_id')
    .eq('event_id', eventId)
    .eq('status', 'completed')
    .not('team_id', 'is', null)

  // Count unique teams (each team = 4 players)
  const uniqueTeams = new Set((teamOrders ?? []).map((o: { team_id: string }) => o.team_id)).size
  const used = (individualCount ?? 0) + uniqueTeams * 4
  return Math.max(0, capacity - used)
}

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .neq('status', 'draft')
    .order('location_name', { ascending: true })

  const { data: allTiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  const eventsWithSpots: EventWithSpots[] = await Promise.all(
    (events ?? []).map(async (event: Event) => {
      const spots =
        event.status === 'soldout'
          ? 0
          : await getSpots(event.id, event.player_capacity ?? 60, supabase)
      return { ...event, spots_remaining: spots }
    })
  )

  const tiersByEvent: Record<string, TicketTier[]> = {}
  for (const tier of (allTiers ?? []) as TicketTier[]) {
    if (!tiersByEvent[tier.event_id]) tiersByEvent[tier.event_id] = []
    tiersByEvent[tier.event_id].push(tier)
  }

  return <HomepageClient events={eventsWithSpots} tiersByEvent={tiersByEvent} />
}
