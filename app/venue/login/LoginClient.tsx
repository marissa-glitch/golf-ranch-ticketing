'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/venue/portal')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00505b] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#171717] uppercase tracking-tight">Venue Portal</h1>
          <p className="text-sm text-[#525252] mt-1">Golf Ranch Classic</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-[#e9e9da] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@golfranch.com"
              required
              className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-[#e9e9da] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#00505b]"
            />
          </div>

          {error && <p className="text-sm text-[#733104]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00505b] text-white font-bold py-3 rounded-lg hover:bg-[#003d45] transition-colors disabled:opacity-50 uppercase tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
