import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/auth/components/login-form'
import { getRootDomainUrl } from '@/lib/tenant-from-host'

export default function OrgNotFoundPanel() {
  const year = new Date().getFullYear()

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#FAFAFA] px-4 py-6 sm:px-8 md:px-10 md:py-8">
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
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <p className="text-5xl font-bold text-[#C20C0C]">404</p>
          <h1 className="text-xl font-bold text-[#111111] sm:text-2xl">
            Organization is not registered
          </h1>
          <p className="text-sm text-[#71717A]">
            This subdomain is not linked to an organization. Go back to the main site or sign in
            as a general user below.
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-lg sm:p-6">
          <p className="mb-4 text-center text-sm font-medium text-[#71717A]">
            Sign in as a general user
          </p>
          <LoginForm />
        </div>
      </div>

      <p className="relative z-10 mt-auto pt-6 text-center text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA] sm:text-xs">
        © {year} ACENSURE | All rights reserved.
      </p>
    </main>
  )
}
