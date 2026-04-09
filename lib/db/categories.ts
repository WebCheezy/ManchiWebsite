import { getServerClient } from "./server"
import type { Category } from "./types"

export async function getCategories(): Promise<Category[]> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, image_url, created_at")
    .order("name")

  if (error) {
    console.error("[getCategories]", error.message)
    return []
  }

  return (data ?? []) as Category[]
}
