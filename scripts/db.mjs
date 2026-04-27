/**
 * Run SQL files directly against Supabase via the Management API.
 * Usage:
 *   node scripts/db.mjs schema   — runs supabase/schema.sql
 *   node scripts/db.mjs seed     — runs supabase/seed.sql
 *   node scripts/db.mjs reset    — drops all tables and reruns schema + seed
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local
 * Get it from: https://supabase.com/dashboard/account/tokens
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const env = fs.readFileSync(envPath, 'utf8')
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const accessToken = process.env.SUPABASE_ACCESS_TOKEN

if (!supabaseUrl || !accessToken) {
  console.error('\nMissing credentials. Add this to your .env.local:')
  console.error('  SUPABASE_ACCESS_TOKEN=your_token_here')
  console.error('\nGet your token at: https://supabase.com/dashboard/account/tokens\n')
  process.exit(1)
}

const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase API error (${res.status}): ${err}`)
  }
  return res.json()
}

const RESET_SQL = `
drop table if exists orders cascade;
drop table if exists teams cascade;
drop table if exists promo_codes cascade;
drop table if exists ticket_tiers cascade;
drop table if exists events cascade;
`

const command = process.argv[2]

async function main() {
  if (command === 'schema') {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8')
    await runSQL(sql)
    console.log('✓ Schema applied.')

  } else if (command === 'seed') {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed.sql'), 'utf8')
    await runSQL(sql)
    console.log('✓ Seed data inserted.')

  } else if (command === 'reset') {
    await runSQL(RESET_SQL)
    console.log('✓ Tables dropped.')
    const schema = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8')
    await runSQL(schema)
    console.log('✓ Schema applied.')
    const seed = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed.sql'), 'utf8')
    await runSQL(seed)
    console.log('✓ Seed data inserted.')
    console.log('\nDatabase reset complete.')

  } else {
    console.log('Usage: node scripts/db.mjs [schema|seed|reset]')
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
