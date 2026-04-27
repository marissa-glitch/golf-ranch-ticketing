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

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      events(name, location_name, location_state),
      ticket_tiers(name, is_team),
      teams(team_name)
    `)
    .order('created_at', { ascending: false })

  const { data: events } = await supabase
    .from('events')
    .select('id, name, location_name, location_state')
    .order('location_name')

  return <AdminDashboard orders={orders ?? []} events={events ?? []} />
}
