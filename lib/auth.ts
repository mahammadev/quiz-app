import { User } from '@supabase/supabase-js'

type SupabaseUserLike = User | {
  app_metadata?: { role?: string; claims?: { role?: string } }
  user_metadata?: { role?: string; claims?: { role?: string } }
} | null

export function isAdminUser(user: SupabaseUserLike): boolean {
  if (!user) return false

  const appRole = user.app_metadata?.role || user.app_metadata?.claims?.role
  const userRole = user.user_metadata?.role || user.user_metadata?.claims?.role

  const role = appRole || userRole

  return role === 'admin'
}
