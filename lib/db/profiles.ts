import { createClient } from "./client"
import type { Profile } from "./types"

export interface ProfileInput {
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
}

/** Check if profile is complete (has required fields like phone) */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  const phone = profile.phone || profile.phone_number
  return !!phone && phone.trim().length > 0
}

/** Check if profile is missing phone number */
export function isPhoneMissing(profile: Profile | null): boolean {
  if (!profile) return true
  const phone = profile.phone || profile.phone_number
  return !phone || phone.trim().length === 0
}

/** Get a user's profile (client-side) */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("[getProfile]", error.message)
    return null
  }
  return data as Profile
}

/** Update a user's profile (client-side) */
export async function updateProfile(userId: string, input: ProfileInput): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("[updateProfile]", error.message)
    return null
  }
  return data as Profile
}

/** Create a profile for a new user (usually called after signup) */
export async function createProfile(userId: string, input: ProfileInput): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: input.full_name || null,
      phone: input.phone || null,
      avatar_url: input.avatar_url || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[createProfile]", error.message)
    return null
  }
  return data as Profile
}

/** Upsert profile - create if doesn't exist, update if it does */
export async function upsertProfile(userId: string, input: ProfileInput): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: input.full_name || null,
      phone: input.phone || null,
      avatar_url: input.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[upsertProfile]", error.message)
    return null
  }
  return data as Profile
}
