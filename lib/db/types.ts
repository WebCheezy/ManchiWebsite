/**
 * Database types matching the Postgres schema.
 * Use these across the app so we can connect the DB later without changing UI types.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

// ─── transport_prices ─────────────────────────────────────────────────────
/** Per-LGA delivery transport fee (`public.transport_prices`, PK: lga). */
export interface TransportPrice {
  lga: string
  state: string
  price: number
  created_at: string
  updated_at: string
}

// ─── addresses ─────────────────────────────────────────────────────────────
export interface Address {
  id: string
  user_id: string
  title: string | null
  state: string
  lga: string
  area: string
  street: string
  house_number: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// ─── categories ────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  image_url: string | null
  created_at: string
}

// ─── availability (per branch) ─────────────────────────────────────────────
export type AvailabilityStatus = "available" | "unavailable" | "out_of_stock"

export interface FoodAvailability {
  id: number
  food_id: number | null
  location: string
  status: AvailabilityStatus | null
  updated_at: string
}

export interface SideAvailability {
  id: number
  side_id: number | null
  location: string
  status: AvailabilityStatus | null
  updated_at: string
}

// ─── foods ─────────────────────────────────────────────────────────────────
export interface Food {
  id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  created_at: string
}

// ─── sides ─────────────────────────────────────────────────────────────────
export interface Side {
  id: number
  name: string
  price: number
  type: string | null
  image_url: string | null
  created_at: string
}

// ─── food_sides (junction) ──────────────────────────────────────────────────
export interface FoodSide {
  food_id: number
  side_id: number
  is_required: boolean
}

// ─── order_items ───────────────────────────────────────────────────────────
export interface OrderItem {
  id: number
  order_id: number | null
  food_id: number | null
  side_id: number | null
  quantity: number
  price_at_time: number
  options: Json | null
  created_at: string
}

// ─── orders ───────────────────────────────────────────────────────────────
export type DeliveryMethod = "delivery" | "pickup"

/** Manchi branch / store location for order fulfillment (`orders.location`, availability tables) */
export type StoreLocation = "Chasemall" | "Aurora" | "Eromo"

export interface Order {
  id: number
  user_id: string
  status: string
  total_amount: number
  delivery_method: DeliveryMethod
  delivery_address: string | null
  delivery_lat: number | null
  delivery_lng: number | null
  location: string | null
  vat: number
  items: Json | null
  /** Optional legacy column — web checkout links Paystack via initialize metadata.order_id instead */
  paystack_reference?: string | null
  created_at: string
}

// ─── profiles ─────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  phone_number: string | null
  updated_at: string | null
}

// ─── transactions ─────────────────────────────────────────────────────────
export interface Transaction {
  id: number
  created_at: string
  reference: string
  email: string
  amount: number
  status: string
  user_id: string | null
  metadata: Json | null
}

// ─── UI / API helpers ──────────────────────────────────────────────────────
/** Food with optional category name for listing pages */
export interface FoodWithCategory extends Food {
  category?: { id: number; name: string } | null
}

/** Summary for header cart (e.g. count from session or pending order) */
export interface CartSummary {
  itemCount: number
  totalAmount?: number
}

/** Default address for header location display */
export interface DefaultAddressSummary {
  id: string
  title: string | null
  area: string
  street: string
  house_number: string
  /** Short single-line label, e.g. "12 Adeola Odeku, Victoria Island..." */
  shortLabel: string
}

/** Side with its required status for a specific food */
export interface SideForFood extends Side {
  is_required: boolean
}

/** Form input for creating/updating an address */
export interface AddressInput {
  title?: string | null
  state: string
  lga: string
  area: string
  street: string
  house_number: string
  is_default?: boolean
}

// ─── Cart Types ─────────────────────────────────────────────────────────────
/** A side item in the cart with quantity */
export interface CartSideItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string | null
}

/** A food item in the cart with selected sides */
export interface CartItem {
  id: string // Unique cart item ID (generated)
  foodId: number
  foodName: string
  foodPrice: number
  foodImage: string | null
  quantity: number
  sides: CartSideItem[]
  addedAt: string // ISO date string
}

/** Full cart state */
export interface Cart {
  items: CartItem[]
  updatedAt: string
}
