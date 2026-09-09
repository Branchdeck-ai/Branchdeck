export const ADMIN_ALLOWLIST = ['adelmuhammed786@gmail.com'];

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_ALLOWLIST.includes(email.trim().toLowerCase());
}
