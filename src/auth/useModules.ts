import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { buildModuleSet, hasAnyModule, hasModule } from './modules'

/** Module visibility hook — for sidebar / route gating (when you wire it up) */
export function useModules() {
  const abilities = useAuthStore((s) => s.abilities)

  const moduleSet = useMemo(() => buildModuleSet(abilities), [abilities])

  return {
    hasModule: (moduleKey: string) => hasModule(abilities, moduleKey),
    hasAnyModule: (moduleKeys: string[]) => hasAnyModule(abilities, moduleKeys),
    moduleSet,
    modules: abilities?.modules ?? [],
  }
}
