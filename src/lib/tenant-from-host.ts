function getRootHost(hostname: string): string {
  const parts = hostname.split('.')
  // acentria.localhost → localhost (browsers treat .localhost as a TLD)
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return 'localhost'
  }
  // lolc-kenya.acensure.test → acensure.test
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname
}

/**
 * Strip the tenant subdomain and return the root domain URL.
 * e.g. lolc-kenya.acensure.test → http://acensure.test:5174
 * e.g. acentria.localhost → http://localhost:5174
 */
export function getRootDomainUrl(): string {
  const { protocol, hostname, port } = window.location
  const rootHost = getRootHost(hostname)
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${rootHost}${portSuffix}`
}

/** true for acentria.localhost or lolc-kenya.acensure.test; false for acensure.test or localhost */
export function isTenantSubdomain(): boolean {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return false
  const parts = host.split('.')
  // *.localhost has only 2 parts, unlike tenant.acensure.test (3+)
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return true
  }
  return parts.length > 2
}
