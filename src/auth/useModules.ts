import { useMemo, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { isBypassUser } from './can'
import { buildModuleSet, hasAnyModule, hasModule } from './modules'

/** Module visibility hook — for sidebar / route gating (when you wire it up) */
export function useModules() {
  const abilities = useAuthStore((s) => s.abilities)

  const moduleSet = useMemo(() => buildModuleSet(abilities), [abilities])

  const checkModule = useCallback(
    (moduleKey: string) => hasModule(abilities, moduleKey),
    [abilities],
  )

  const checkAnyModule = useCallback(
    (moduleKeys: string[]) => hasAnyModule(abilities, moduleKeys),
    [abilities],
  )

  return {
    hasModule: checkModule,
    hasAnyModule: checkAnyModule,
    moduleSet,
    modules: abilities?.modules ?? [],
    /** true for super_admin / is_general — all hasModule() checks return true */
    isBypass: isBypassUser(abilities),
  }
}
