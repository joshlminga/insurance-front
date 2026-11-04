import { useAuthStore } from '@/stores/auth-store'
import { isPlatformSuperAdmin } from './org-context'

/**
 * Default org / default location / platform super_admin may mark products for_public.
 * Everyone else must keep Public Product locked to false.
 */
export function useCanSetPublicProduct(): boolean {
  const abilities = useAuthStore((s) => s.abilities)

  if (isPlatformSuperAdmin(abilities)) {
    return true
  }

  const context = abilities?.context
  if (context === undefined) {
    // No org context (bypass-style session) — match API isDefaultOrganizationContext.
    return true
  }

  return Boolean(context.organization_is_default || context.location_is_default)
}
