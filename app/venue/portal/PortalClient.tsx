'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface OrderRow {
  id: string
  created_at: string
  confirmed_at: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  pay_amount: number
  status: string
  events: { name: string; date: string; location_name: string; location_state: string } | null
  ticket_tiers: { name: string; is_team: boolean } | null
  teams: { team_name: string } | null
}

export default function PortalClient() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [locationId, setLocationId] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function init() {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/venue/login')
        return
      }

      const res = await fetch('/api/venue/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.status === 401 || res.status === 403) {
        router.replace('/venue/login')
        return
      }

      const data = await res.json()
      setOrders(data.orders ?? [])
      setLocationId(data.locationId ?? '')
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSignOut() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.replace('/venue/login')
  }

  function exportCSV() {
    const headers = ['Order #', 'Name', 'Email', 'Phone', 'Event', 'Date', 'Ticket Type', 'Team', 'Amount Paid', 'Purchased']
    const rows = filtered.map((o) => [
      o.id.split('-')[0].toUpperCase(),
      o.customer_name,
      o.customer_email,
      o.customer_phone ?? '',
      o.events?.name ?? '',
      o.events?.date ?? '',
      o.ticket_tiers?.name ?? '',
      o.teams?.team_name ?? '',
      (o.pay_amount / 100).toFixed(2),
      o.confirmed_at ? new Date(o.confirmed_at).toLocaleDateString() : '',
    ])

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `golf-ranch-${locationId}-orders.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.customer_phone ?? '').includes(q) ||
      (o.teams?.team_name ?? '').toLowerCase().includes(q)
    )
  })

  const totalRevenue = orders.reduce((sum, o) => sum + o.pay_amount, 0)
  const locationName = orders[0]?.events?.location_name ?? ''

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        <p className="text-[#525252]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Header */}
      <header className="bg-[#00505b] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[#dab806] text-xs font-bold uppercase tracking-widest">Venue Portal</p>
            <h1 className="text-white font-black uppercase tracking-tight text-lg">
              {locationName || locationId}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
            <p className="text-xs text-[#525252] uppercase tracking-wide font-medium mb-1">Total Tickets Sold</p>
            <p className="text-3xl font-black text-[#171717]">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#e9e9da] p-5">
            <p className="text-xs text-[#525252] uppercase tracking-wide font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-[#171717]">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or team..."
            className="flex-1 border border-[#e9e9da] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00505b]"
          />
          <button
            onClick={exportCSV}
            className="bg-[#00505b] text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-[#003d45] transition-colors whitespace-nowrap uppercase tracking-wide"
          >
            Export CSV
          </button>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-xl border border-[#e9e9da] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#525252] text-sm">
              {search ? 'No results found.' : 'No completed orders yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e9e9da] bg-[#f7f7f2]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Buyer</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Ticket</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Team</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Paid</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-[#525252] uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, i) => (
                    <tr
                      key={order.id}
                      className={`border-b border-[#e9e9da] last:border-0 ${i % 2 === 0 ? '' : 'bg-[#f7f7f2]/50'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#171717]">{order.customer_name}</p>
                        <p className="text-xs text-[#525252] font-mono">{order.id.split('-')[0].toUpperCase()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#171717]">{order.customer_email}</p>
                        {order.customer_phone && (
                          <p className="text-xs text-[#525252]">{order.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#171717]">{order.events?.name}</p>
                        <p className="text-xs text-[#525252]">{order.events?.date}</p>
                      </td>
                      <td className="px-4 py-3 text-[#171717]">{order.ticket_tiers?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-[#171717]">{order.teams?.team_name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#171717]">
                        {formatPrice(order.pay_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-[#525252] text-xs">
                        {order.confirmed_at
                          ? new Date(order.confirmed_at).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
