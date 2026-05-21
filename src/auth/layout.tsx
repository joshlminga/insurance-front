
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
    <main className="relative min-h-svh flex flex-col">
       <Navbar />
      <div className="bg-background flex flex-1 flex-col items-center gap-6 px-6 md:px-10 pt-18 sm:pt-20 lg:pt-50 pb-6 md:pb-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-bold text-xl text-[#C20C0C]">
              <span>{title}</span>
            </div>
            <h1 className="text-xl font-bold">{description}</h1>
          </div>
          {showGoogleAuth && (
            <>
              <Field className="grid gap-4 sm:grid-cols-1">
                <Button
                  {...{
                    onClick: () => console.log()
                  }}
                  type="button"
                  variant="outline">
                  <FcGoogle size={20} />
                  <p className='font-bold leading-6 text-sm'>Continue with Google</p>
                </Button>
              </Field>
              <FieldSeparator>Or</FieldSeparator>
            </>
          )}
          {children ?? <Outlet />}
        </div>
      </div>
      <Footer />
    </main>
  )
}
