export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'true'

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  const supabase = createServerClient()

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      events!event_id(name, location_name, location_state),
      ticket_tiers!ticket_tier_id(name, is_team),
      teams!team_id(team_name)
    `)
    .order('created_at', { ascending: false })

  if (ordersError) console.error('Admin orders query error:', ordersError)
  console.log('Admin orders count:', orders?.length ?? 0)

  const { data: events } = await supabase
    .from('events')
    .select('id, name, location_name, location_state')
    .order('location_name')

  return <AdminDashboard orders={orders ?? []} events={events ?? []} />
}
