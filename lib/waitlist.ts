import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase'

const INVITE_WINDOW_MS = 48 * 60 * 60 * 1000 // 48 hours

export async function notifyNext(eventId: string): Promise<void> {
  const supabase = createServerClient()

  const { data: entry } = await supabase
    .from('waitlist_entries')
    .select('id, customer_email, customer_name')
    .eq('event_id', eventId)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!entry) return

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + INVITE_WINDOW_MS).toISOString()

  await supabase
    .from('waitlist_entries')
    .update({
      status: 'notified',
      invite_token: token,
      invite_expires_at: expiresAt,
      notified_at: new Date().toISOString(),
    })
    .eq('id', entry.id)

  // TODO (Phase 3): Send HubSpot transactional email to entry.customer_email
  // with a link to /events/[slug]/checkout?tier=[tierId]&waitlist_token=[token]
  console.log(
    `[Waitlist] Notified ${entry.customer_email} for event ${eventId}. Token expires: ${expiresAt}`
  )
}

export async function validateWaitlistToken(token: string, eventId: string): Promise<boolean> {
  const supabase = createServerClient()

  const { data: entry } = await supabase
    .from('waitlist_entries')
    .select('id, invite_expires_at')
    .eq('invite_token', token)
    .eq('event_id', eventId)
    .eq('status', 'notified')
    .single()

  if (!entry) return false

  if (new Date(entry.invite_expires_at) < new Date()) {
    await supabase
      .from('waitlist_entries')
      .update({ status: 'expired' })
      .eq('id', entry.id)
    return false
  }

  return true
}

export async function convertWaitlistEntry(token: string): Promise<void> {
  const supabase = createServerClient()

  await supabase
    .from('waitlist_entries')
    .update({ status: 'converted' })
    .eq('invite_token', token)
    .eq('status', 'notified')
}
