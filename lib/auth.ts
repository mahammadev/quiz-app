type SupabaseUserLike = {
  app_metadata: any
  user_metadata: any
} | null

export function isAdminUser(user: SupabaseUserLike): boolean {
  const role =
    user?.app_metadata?.role ??
    user?.app_metadata?.claims?.role ??
    user?.user_metadata?.role ??
    user?.user_metadata?.claims?.role

  return role === 'admin'
}
