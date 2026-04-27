export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Event, Team, TicketTier } from '@/lib/types'
import TeamJoinClient from './TeamJoinClient'

interface Props {
  params: Promise<{ invite_code: string }>
}

export default async function TeamJoinPage({ params }: Props) {
  const { invite_code } = await params
  const supabase = createServerClient()

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', invite_code)
    .single()

  if (!team) notFound()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', team.event_id)
    .single()

  if (!event) notFound()

  const { data: tier } = team.ticket_tier_id
    ? await supabase.from('ticket_tiers').select('*').eq('id', team.ticket_tier_id).single()
    : { data: null }

  return (
    <TeamJoinClient
      team={team as Team}
      event={event as Event}
      tier={tier as TicketTier | null}
    />
  )
}
