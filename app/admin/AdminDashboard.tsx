'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface OrderRow {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  pay_amount: number
  status: string
  upsell_added: boolean
  shipping_address: object | null
  split_pay: boolean
  team_id: string | null
  events: { name: string; location_name: string; location_state: string } | null
  ticket_tiers: { name: string; is_team: boolean } | null
  teams: { team_name: string } | null
}

interface EventOption {
  id: string
  name: string
  location_name: string
  location_state: string
}

interface Props {
  orders: OrderRow[]
  events: EventOption[]
}

type SortKey = 'created_at' | 'customer_name' | 'pay_amount' | 'status'

export default function AdminDashboard({ orders, events }: Props) {
  const [search, setSearch] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState<'orders' | 'revenue' | 'upsells' | 'teams'>('orders')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q)
    const matchEvent = !filterEvent || o.events?.location_name === filterEvent
    return matchSearch && matchEvent
  })

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = a[sortKey] ?? ''
    let bv: string | number = b[sortKey] ?? ''
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  // Revenue per event
  const revenueByEvent: Record<string, { location: string; total: number; count: number }> = {}
  for (const o of orders) {
    if (o.status !== 'completed') continue
    const loc = o.events ? `${o.events.location_name}, ${o.events.location_state}` : 'Unknown'
    if (!revenueByEvent[loc]) revenueByEvent[loc] = { location: loc, total: 0, count: 0 }
    revenueByEvent[loc].total += o.pay_amount
    revenueByEvent[loc].count += 1
  }

  // Upsell orders
  const upsellOrders = orders.filter((o) => o.upsell_added && o.shipping_address)

  // Team rosters
  const teamMap: Record<string, OrderRow[]> = {}
  for (const o of orders) {
    if (!o.team_id || !o.teams) continue
    const key = `${o.teams.team_name}__${o.team_id}`
    if (!teamMap[key]) teamMap[key] = []
    teamMap[key].push(o)
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'orders', label: 'All Orders' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'upsells', label: 'Upsell / Shipping' },
    { key: 'teams', label: 'Team Rosters' },
  ]

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* Header */}
      <header className="bg-[#00505b] px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-black uppercase tracking-wide text-lg">
            Admin — Golf Ranch Classic
          </h1>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-[#e9e9da] rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#00505b] text-white'
                  : 'text-[#525252] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 border border-[#e9e9da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00505b] bg-white"
              />
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="border border-[#e9e9da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00505b] bg-white"
              >
                <option value="">All Locations</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.location_name}>
                    {ev.location_name}, {ev.location_state}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-[#525252] mb-3">{sorted.length} orders</p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-[#e9e9da] text-sm">
                <thead>
                  <tr className="border-b border-[#e9e9da]">
                    {[
                      { key: 'created_at' as SortKey, label: 'Date' },
                      { key: 'customer_name' as SortKey, label: 'Name' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="text-left px-4 py-3 font-semibold text-[#525252] cursor-pointer hover:text-[#171717] whitespace-nowrap"
                      >
                        {label}{sortArrow(key)}
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 font-semibold text-[#525252] whitespace-nowrap">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#525252] whitespace-nowrap">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#525252] whitespace-nowrap">Tier</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#525252] whitespace-nowrap">Team</th>
                    <th
                      onClick={() => toggleSort('pay_amount')}
                      className="text-left px-4 py-3 font-semibold text-[#525252] cursor-pointer hover:text-[#171717] whitespace-nowrap"
                    >
                      Amount{sortArrow('pay_amount')}
                    </th>
                    <th
                      onClick={() => toggleSort('status')}
                      className="text-left px-4 py-3 font-semibold text-[#525252] cursor-pointer hover:text-[#171717] whitespace-nowrap"
                    >
                      Status{sortArrow('status')}
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#525252]">Upsell</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((order) => (
                    <tr key={order.id} className="border-b border-[#e9e9da] last:border-0 hover:bg-[#f7f7f2]">
                      <td className="px-4 py-3 text-[#525252] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#171717] whitespace-nowrap">{order.customer_name}</td>
                      <td className="px-4 py-3 text-[#525252]">{order.customer_email}</td>
                      <td className="px-4 py-3 text-[#525252] whitespace-nowrap">
                        {order.events ? `${order.events.location_name}, ${order.events.location_state}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#525252] whitespace-nowrap">{order.ticket_tiers?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-[#525252] whitespace-nowrap">{order.teams?.team_name ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-[#171717] whitespace-nowrap">{formatPrice(order.pay_amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                          'bg-[#e9e9da] text-[#525252]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.upsell_added ? '✓' : ''}
                      </td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#525252]">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue tab */}
        {activeTab === 'revenue' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(revenueByEvent).map((ev) => (
              <div key={ev.location} className="bg-white rounded-xl border border-[#e9e9da] p-5">
                <p className="font-bold text-[#171717] mb-1">{ev.location}</p>
                <p className="text-3xl font-black text-[#00505b]">{formatPrice(ev.total)}</p>
                <p className="text-sm text-[#525252] mt-1">{ev.count} completed orders</p>
              </div>
            ))}
            {Object.keys(revenueByEvent).length === 0 && (
              <p className="text-[#525252] col-span-full">No completed orders yet.</p>
            )}
          </div>
        )}

        {/* Upsells tab */}
        {activeTab === 'upsells' && (
          <div className="overflow-x-auto">
            <p className="text-sm text-[#525252] mb-3">{upsellOrders.length} upsell orders</p>
            <table className="w-full bg-white rounded-xl border border-[#e9e9da] text-sm">
              <thead>
                <tr className="border-b border-[#e9e9da]">
                  <th className="text-left px-4 py-3 font-semibold text-[#525252]">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#525252]">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#525252]">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#525252]">Ship To</th>
                </tr>
              </thead>
              <tbody>
                {upsellOrders.map((o) => {
                  const addr = o.shipping_address as { address1?: string; address2?: string; city?: string; state?: string; zip?: string } | null
                  return (
                    <tr key={o.id} className="border-b border-[#e9e9da] last:border-0 hover:bg-[#f7f7f2]">
                      <td className="px-4 py-3 font-medium text-[#171717]">{o.customer_name}</td>
                      <td className="px-4 py-3 text-[#525252]">{o.customer_email}</td>
                      <td className="px-4 py-3 text-[#525252]">
                        {o.events ? `${o.events.location_name}, ${o.events.location_state}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#525252]">
                        {addr
                          ? `${addr.address1}${addr.address2 ? `, ${addr.address2}` : ''}, ${addr.city}, ${addr.state} ${addr.zip}`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
                {upsellOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#525252]">
                      No upsell orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Teams tab */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {Object.entries(teamMap).map(([key, teamOrders]) => {
              const teamName = key.split('__')[0]
              const eventLabel = teamOrders[0]?.events
                ? `${teamOrders[0].events.location_name}, ${teamOrders[0].events.location_state}`
                : ''
              return (
                <div key={key} className="bg-white rounded-xl border border-[#e9e9da] p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-[#171717]">{teamName}</p>
                      <p className="text-sm text-[#525252]">{eventLabel}</p>
                    </div>
                    <span className="text-xs font-semibold bg-[#e9e9da] text-[#525252] px-2 py-0.5 rounded-full">
                      {teamOrders.length}/4 paid
                    </span>
                  </div>
                  <div className="space-y-2">
                    {teamOrders.map((o) => (
                      <div key={o.id} className="flex justify-between items-center text-sm">
                        <span className="text-[#171717]">{o.customer_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#525252]">{o.customer_email}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                            o.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-[#e9e9da] text-[#525252]'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {Object.keys(teamMap).length === 0 && (
              <p className="text-[#525252]">No team orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
