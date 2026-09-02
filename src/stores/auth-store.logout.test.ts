import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_STORAGE_KEY, AUTH_TAB_SIGNED_OUT_KEY } from '@/auth/constants'
import { getAccessToken } from '@/auth/access-token'
import { isTabSignedOut } from '@/auth/session-wipe'

vi.mock('@/auth/auth-service', () => ({
  checkAuth: vi.fn(),
  fetchAbilities: vi.fn(),
  logoutOnServer: vi.fn(() => new Promise(() => {})),
  refreshSession: vi.fn(),
  resolveOrganization: vi.fn(),
}))

vi.mock('@/utils/providers', () => ({
  queryClient: { clear: vi.fn() },
}))

function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.get(key) ?? null
    },
    key(index: number) {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, String(value))
    },
  }
}

const memoryLocal = createMemoryStorage()
const memorySession = createMemoryStorage()

Object.defineProperty(window, 'localStorage', { value: memoryLocal, configurable: true })
Object.defineProperty(window, 'sessionStorage', { value: memorySession, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: memoryLocal, configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: memorySession, configurable: true })

const jwt = 'eyJhbGciOiJIUzI1NiJ9.fake.jwt'
const abilities = {
  is_general: false,
  roles: ['super_admin'],
  permissions: ['account.list'],
  modules: [],
  scopes: [],
}

function seedLoggedInStore() {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: { id: 2, name: 'Acentria Tech', email: 'tech@acentriagroup.com' },
      token: jwt,
      guest: null,
      isGeneral: false,
      abilities,
      expiresAt: Date.now() + 3600_000,
      organizationLocationId: 1,
    }),
  )
}

describe('logout must not leave a JWT in localStorage', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    seedLoggedInStore()
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.setState({
      user: {
        id: 2,
        name: 'Acentria Tech',
        email: 'tech@acentriagroup.com',
        username: 'acentria',
        slug: null,
        phone: '705200222',
        is_active: true,
        is_general: false,
      },
      token: jwt,
      guest: null,
      isGeneral: false,
      abilities,
      expiresAt: Date.now() + 3600_000,
      organizationLocationId: 1,
    })
  })

  it('removes token, user, and abilities immediately even if API logout never returns', async () => {
    const { useAuthStore, persistAuthState } = await import('@/stores/auth-store')

    useAuthStore.getState().logout()
    persistAuthState()

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().abilities).toBeNull()
    expect(isTabSignedOut()).toBe(true)
    expect(window.sessionStorage.getItem(AUTH_TAB_SIGNED_OUT_KEY)).toBe('1')
  })

  it('ignores a late token refresh so auth-storage is not rewritten', async () => {
    const { useAuthStore, persistAuthState } = await import('@/stores/auth-store')

    useAuthStore.getState().logout()
    useAuthStore.getState().setSession({
      access_token: 'new-jwt-after-refresh',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 2,
        name: 'Acentria Tech',
        email: 'tech@acentriagroup.com',
        username: 'acentria',
        slug: null,
        phone: '705200222',
        is_active: true,
        is_general: false,
      },
      is_general: false,
      abilities,
    })
    persistAuthState()

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    expect(raw).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
