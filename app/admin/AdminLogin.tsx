'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      setError('Incorrect password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#00505b] uppercase tracking-wide">Admin</h1>
          <p className="text-[#525252] text-sm mt-1">Golf Ranch Classic Ticketing</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-[#e9e9da] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-[#733104]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00505b] text-white font-bold py-3 rounded-lg hover:bg-[#003d45] transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
