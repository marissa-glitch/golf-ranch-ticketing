export type EventStatus = 'draft' | 'published' | 'soldout' | 'cancelled'

export interface Event {
  id: string
  name: string
  slug: string
  location_id: string
  location_name: string
  location_state: string
  date: string
  start_time: string | null
  end_time: string | null
  description: string | null
  hero_image_url: string | null
  player_capacity: number | null
  status: EventStatus
  created_at: string
}

export interface TicketTier {
  id: string
  event_id: string
  name: string
  price: number          // cents
  per_player: number | null  // cents
  description: string | null
  is_team: boolean
  is_ranch_pass: boolean
  sort_order: number | null
  active: boolean
}

export interface Team {
  id: string
  event_id: string
  team_name: string
  invite_code: string
  ticket_tier_id: string | null
  captain_order_id: string | null
  created_at: string
}

export interface Order {
  id: string
  event_id: string
  ticket_tier_id: string
  team_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  ranch_pass_code: string | null
  pay_amount: number      // cents
  discount: number        // cents
  promo_code_id: string | null
  upsell_added: boolean
  upsell_amount: number   // cents
  shipping_address: ShippingAddress | null
  stripe_session_id: string | null
  stripe_payment_id: string | null
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  confirmed_at: string | null
}

export interface ShippingAddress {
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
}

export interface PromoCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  valid_from: string | null
  valid_until: string | null
  event_id: string | null
  active: boolean
}

export interface WaitlistEntry {
  id: string
  event_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: 'waiting' | 'notified' | 'expired' | 'converted' | 'cancelled'
  invite_token: string | null
  invite_expires_at: string | null
  notified_at: string | null
  created_at: string
}

// Derived / computed
export interface EventWithSpots extends Event {
  spots_remaining: number
}
