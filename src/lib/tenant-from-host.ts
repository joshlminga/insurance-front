/**
 * Strip the tenant subdomain and return the root domain URL.
 * e.g. lolc-kenya.acensure.test → http://acensure.test:5174
 */
export function getRootDomainUrl(): string {
  const { protocol, hostname, port } = window.location
  const parts = hostname.split('.')
  const rootHost = parts.length > 2 ? parts.slice(-2).join('.') : hostname
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${rootHost}${portSuffix}`
}

/** true for lolc-kenya.acensure.test; false for acensure.test or localhost */
export function isTenantSubdomain(): boolean {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return false
  return host.split('.').length > 2
}
