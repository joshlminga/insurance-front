/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { Button, ReuseableInput } from '@/dev/core'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { UseApiMutation } from '@/hooks/hooks'
import { UseAuth } from '@/stores/auth-store'
import {
  SESSION_EXPIRED_EVENT,
  useSessionTimeoutStore,
} from '@/stores/session-timeout-store'
import { LoginSchema } from '@/types/form-schema'
import type { LoginFormValues } from '@/types/schema'
import type { LoginResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'

const REMEMBER_EMAIL_KEY = 'session-timeout-remember-email'
const signupPath = `/${EPREFIX.AUTH}${EROUTES.SIGNUP}`

/**
 * Global dialog shown when the API returns 401 (session expired).
 * Mounted in main.tsx so it works on any page without losing form data.
 */
export function SessionTimeoutDialog() {
  const { isOpen, open, close } = useSessionTimeoutStore()
  const { login, logout, setGuest } = UseAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Listen for 401 events from the axios interceptor and open this dialog.
  useEffect(() => {
    const handleSessionExpired = () => {
      logout()
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
      form.reset({
        email: savedEmail ?? '',
        password: '',
      })
      setRememberMe(!!savedEmail)
      open()
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [form, logout, open])

  const loginMutation = UseApiMutation<LoginResponse, LoginFormValues>({
    url: 'auth/login',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: LoginResponse) => {
        if (data?.data?.status === 'NOT_VERIFIED') {
          setGuest(data?.data?.guest)
          ShowToast.info(data.message || 'Please verify your email to continue.')
          return
        }

        ShowToast.success(data.message || 'Login successful!')
        login(data.user, data.access_token, data.is_general)

        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, form.getValues('email'))
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }

        form.reset({ email: '', password: '' })
        close()
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Login failed!')
      },
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      close()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Your session was timed out, Login to proceed</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in again to continue where you left off.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <Field>
              <ReuseableInput
                className="w-full h-12 rounded-md border border-gray-300"
                control={form.control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter email address"
              />
            </Field>

            <Field className="flex flex-col gap-1">
              <div className="relative">
                <ReuseableInput
                  className="w-full h-12 rounded-md border border-gray-300 pr-10"
                  control={form.control}
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </Field>

            <Field>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="session-timeout-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="w-4 h-4 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
                />
                <label
                  htmlFor="session-timeout-remember-me"
                  className="text-sm cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            </Field>

            <Field>
              <Button
                className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                type="submit"
                loading={loginMutation.isPending}
              >
                <span className="font-semibold text-sm">Login</span>
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <FieldDescription className="text-center text-sm">
          <a
            href={signupPath}
            className="text-[#C20C0C] font-medium hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Click to register
          </a>
        </FieldDescription>
      </DialogContent>
    </Dialog>
  )
}
