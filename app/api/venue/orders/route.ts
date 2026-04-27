import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Validate the session token and get the user
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get venue profile to determine location
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('venue_profiles')
    .select('location_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'No venue profile found' }, { status: 403 })

  // Fetch all completed orders for this venue's location
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      customer_name,
      customer_email,
      customer_phone,
      pay_amount,
      status,
      confirmed_at,
      events!inner ( name, date, start_time, location_name, location_state, location_id ),
      ticket_tiers ( name, is_team ),
      teams ( team_name )
    `)
    .eq('events.location_id', profile.location_id)
    .eq('status', 'completed')
    .order('confirmed_at', { ascending: false })

  if (error) {
    console.error('Venue orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  return NextResponse.json({ orders, locationId: profile.location_id })
}
