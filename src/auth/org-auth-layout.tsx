import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { OrgResolveData } from '@/auth/types'
import { getRootDomainUrl } from '@/lib/tenant-from-host'

interface OrgAuthLayoutProps {
  organization: OrgResolveData
  children: ReactNode
}

export default function OrgAuthLayout({ organization, children }: OrgAuthLayoutProps) {
  const orgName = organization.organization_name ?? 'Organization'
  const locationName = organization.location_name
  const logoUrl = organization.logo_url
  const year = new Date().getFullYear()
  // e.g. "LOLC Kenya - Kenya"
  const titleLine = locationName ? `${orgName} - ${locationName}` : orgName

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      {/* Left branding panel — hidden on small screens */}
      <section
        className="relative hidden w-full overflow-hidden md:flex md:w-1/2 md:min-h-dvh md:flex-col"
        aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/auth-bg.webp')" }}
        />
        {/* Dark overlay so white/red taglines stay readable */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mt-auto flex w-full flex-col items-center px-10 pb-10 text-center lg:px-14 lg:pb-14">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white lg:text-3xl">
            Transforming Insurance.
          </h2>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-[#C20C0C] lg:text-3xl">
            One Platform. Endless Possibilities.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/90">
            A unified insurance platform that enables insurers, brokers, and partners to generate accurate quotations, manage policies, process claims, and oversee every stage of the insurance lifecycle with confidence.
          </p>
        </div>
      </section>

      {/* Right login panel */}
      <section className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#FAFAFA] px-4 py-6 sm:px-8 md:w-1/2 md:px-10 md:py-8">
        {/* Full-width dotted wave along the bottom of the right panel */}
        <img
          src="/fluid-dots-red.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full opacity-35"
        />

        <a
          href={getRootDomainUrl()}
          className="relative z-10 inline-flex w-fit items-center gap-2 rounded-md border border-[#C20C0C]/30 bg-white px-3 py-2 text-sm font-semibold text-[#C20C0C] shadow-sm transition-colors hover:bg-[#C20C0C] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </a>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${orgName} logo`}
                className="h-16 w-40 rounded-md border border-[#E4E4E7] bg-white object-contain p-2 shadow-sm"
              />
            ) : (
              <img
                src="/logo/auth-logo.png"
                alt="Acensure logo"
                className="h-16 w-40 rounded-md object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-[#111111] sm:text-2xl">
                {titleLine}
              </h1>
            </div>
            <p className="text-sm text-[#71717A]">Sign in to your account to continue</p>
          </div>

          <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-lg sm:p-6">
            {children}
          </div>
        </div>

        <p className="relative z-10 mt-auto pt-6 text-center text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA] sm:text-xs">
          © {year} ACENSURE | All rights reserved.
        </p>
      </section>
    </main>
  )
}
