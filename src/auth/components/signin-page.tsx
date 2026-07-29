import { Loader2 } from 'lucide-react'
import { UseAuth } from '@/stores/auth-store'
import AuthLayoutPage from '@/auth/layout'
import OrgAuthLayout from '@/auth/org-auth-layout'
import OrgNotFoundPanel from '@/auth/components/org-not-found-panel'
import { LoginForm } from '@/auth/components/login-form'
import { isTenantSubdomain } from '@/lib/tenant-from-host'

export default function SignInPage() {
  const { resolvedOrganization, orgResolveStatus, isLoading } = UseAuth()
  const onSubdomain = isTenantSubdomain()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C20C0C]" aria-label="Loading" />
      </div>
    )
  }

  // Tenant subdomain with a registered organization
  if (
    onSubdomain &&
    orgResolveStatus === 'resolved' &&
    resolvedOrganization?.organization_location_id != null
  ) {
    return (
      <OrgAuthLayout organization={resolvedOrganization}>
        <LoginForm variant="org" />
      </OrgAuthLayout>
    )
  }

  // Tenant subdomain but org not registered (null or API 404)
  if (onSubdomain && (orgResolveStatus === 'not_found' || orgResolveStatus === 'failed')) {
    return <OrgNotFoundPanel />
  }

  // Root domain — general login unchanged
  return (
    <AuthLayoutPage title="Please sign in" description="to purchase your cover">
      <LoginForm />
    </AuthLayoutPage>
  )
}
