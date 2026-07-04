import { unstable_noStore as noStore } from "next/cache"
import { getMenuSnapshot } from "./menu-backend.server"
import type { Category } from "./types"

export async function getCategories(): Promise<Category[]> {
  noStore()
  const snapshot = await getMenuSnapshot()
  return snapshot.categories
}
