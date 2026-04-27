export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { validateWaitlistToken } from '@/lib/waitlist'
import { Event, TicketTier } from '@/lib/types'
import CheckoutClient from './CheckoutClient'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tier?: string; waitlist_token?: string }>
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tier: tierId, waitlist_token: waitlistToken } = await searchParams

  const supabase = createServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event || event.status === 'cancelled') notFound()

  if (event.status === 'soldout') {
    if (!waitlistToken) notFound()
    const valid = await validateWaitlistToken(waitlistToken, event.id)
    if (!valid) redirect(`/events/${slug}`)
  }

  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', event.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  const selectedTier = tierId
    ? (tiers ?? []).find((t: TicketTier) => t.id === tierId) ?? null
    : null

  return (
    <CheckoutClient
      event={event as Event}
      tiers={(tiers ?? []) as TicketTier[]}
      initialTier={selectedTier as TicketTier | null}
      waitlistToken={waitlistToken ?? null}
    />
  )
}
