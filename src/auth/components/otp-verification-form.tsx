/* eslint-disable @typescript-eslint/no-explicit-any */
import { OTPForm } from '@/components/otp-form'
import { Button } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import { OTPVerificationSchema } from '@/types/form-schema'
import { OTPFormValues, ResendOTPFormValues } from '@/types/schema'
import { LoginResponse } from '@/types/types'
import { normalizeLoginResponse } from '@/auth/session'
import { homePathForAbilities } from '@/auth/role-destination'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

export function OtpVerificationAuthForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { setSession, guest } = UseAuth()
  const navigate = useNavigate()

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(OTPVerificationSchema),
    defaultValues: {
      token: '',
      token_type: 'email_verification',
      // Prefer email token name from auth verification; fall back to phone (quote flows)
      token_name:
        guest?.verification?.email?.verification_token_name
        ?? guest?.verification?.phone?.verification_token_name
        ?? 'register',
    },
  })

  const submitMutation = UseApiMutation<LoginResponse, OTPFormValues>({
    url: 'auth/account-verification',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        const session = normalizeLoginResponse(data)
        setSession(session)
        ShowToast.success(data.message || 'Verified successfully!')
        navigate(homePathForAbilities(session.abilities))
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || 'Submission failed!')
      },
    },
  })

  const resendMutation = UseApiMutation<LoginResponse, ResendOTPFormValues>({
    url: 'auth/account-verification/retry',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'Verification code resent!')
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to resend code.')
      },
    },
  })

  const onSubmit = (data: OTPFormValues) => {
    submitMutation.mutate(data)
  }

  const handleOtpComplete = () => {
    if (submitMutation.isPending) return
    form.handleSubmit(onSubmit)()
  }

  const canResendWithGuestId = Boolean(guest?.guestId)

  const resendOtp = () => {
    if (!canResendWithGuestId) {
      navigate(`/${EPREFIX.AUTH}${EROUTES.REQUEST_VERIFICATION}`)
      return
    }

    const payload: ResendOTPFormValues = {
      type: 'guest',
      id: Number(guest?.guestId),
      token_type: String(
        guest?.verification?.email?.verification_token_type
        ?? guest?.verification?.phone?.verification_token_type
        ?? 'email_verification',
      ),
      token_name: String(
        guest?.verification?.email?.verification_token_name
        ?? guest?.verification?.phone?.verification_token_name
        ?? 'register',
      ),
    }
    resendMutation.mutate(payload)
  }

  return (
    <FormProvider {...form}>
      <div className={cn('flex flex-col gap-6 text-center', className)} {...props}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center w-full text-center" >
          <div className="w-full flex flex-col items-center text-center">
            <OTPForm
              className="w-full border-0 shadow-none bg-transparent"
              showFooter={false}
              onComplete={handleOtpComplete}
              title=''
              description=''
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Didn&apos;t receive the code?{' '}
              {canResendWithGuestId ? (
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault()
                    resendOtp()
                  }}
                  className="text-[#C20C0C] font-semibold underline">
                  Resend
                </Link>
              ) : (
                <Link
                  to={`/${EPREFIX.AUTH}${EROUTES.REQUEST_VERIFICATION}`}
                  className="text-[#C20C0C] font-semibold underline">
                  Request a new code
                </Link>
              )}
            </p>
          </div>

          <Button
            className="w-full h-12 mt-6 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
            type="submit"
            loading={submitMutation.isPending}>
            <span className="font-semibold text-sm">Verify OTP</span>
          </Button>
        </form>
      </div>
    </FormProvider>
  )
}
