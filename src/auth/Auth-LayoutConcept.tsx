import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Field, FieldSeparator } from "@/components/ui/field"
import { Footer } from '@/app/landing/components/footer'
import Navbar from '@/app/landing/components/navbar'

interface AuthLayoutProps {
  children?: ReactNode
  title: string
  description: string
  showGoogleAuth?: boolean
}

export default function AuthLayoutPage({
  children,
  title,
  description,
  showGoogleAuth = false
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col bg-white pt-14 sm:pt-16 md:pt-16 lg:pt-16">
        <section className="relative isolate flex min-h-[calc(100dvh-3,5rem)] flex-1 flex-col overflow-hidden sm:min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-3.25rem)] lg:min-h-[calc(100dvh-4rem)]">

          <div className="pointer-events-none absolute inset-0 z-0 hidden md:flex" aria-hidden="true">
            <div className="relative w-1/2 bg-white" />
            <div
              className="w-1/2 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('/auth-bg.webp')` }}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 bg-white md:hidden" aria-hidden="true" />

          <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-3 py-6 sm:px-5 sm:py-8 md:overflow-visible md:px-6 md:py-10 lg:py-12">
            <div
              className={[
                'w-full max-w-[min(100%,480px)] shrink-0 border border-[#E4E4E7] bg-white',
                'p-5 shadow-lg sm:p-6 sm:shadow-xl md:absolute md:left-1/2 md:p-7 md:shadow-2xl md:-translate-x-1/2 lg:-translate-x-3/4 lg:p-8',
              ].join(' ')}>
              <div className="mb-5 flex flex-col items-center gap-1.5 text-center sm:mb-6 sm:gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#111111] sm:text-2xl lg:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="max-w-sm text-xs leading-relaxed text-[#71717A] sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>

              {showGoogleAuth && (
                <>
                  <Field className="mb-4 grid gap-4 sm:grid-cols-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center gap-2"
                    >
                      <FcGoogle size={20} />
                      <span className="text-sm font-bold">Continue with Google</span>
                    </Button>
                  </Field>
                  <FieldSeparator className="mb-4">Or</FieldSeparator>
                </>
              )}

              {children ?? <Outlet />}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
