/* eslint-disable @typescript-eslint/no-explicit-any */
import { OTPForm } from '@/components/otp-form'
import { Button } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import { OTPVerificationSchema } from '@/types/form-schema'
import { OTPFormValues } from '@/types/schema'
import { LoginResponse } from '@/types/types'
import { normalizeLoginResponse } from '@/auth/session'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

export function OtpVerificationAuthForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { setSession, guest } = UseAuth()

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(OTPVerificationSchema),
    defaultValues: {
      token: '',
      token_type: 'email_verification',
      token_name: guest?.verification?.phone?.verification_token_name,
    },
  })

  const submitMutation = UseApiMutation<LoginResponse, OTPFormValues>({
    url: 'auth/account-verification',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        setSession(normalizeLoginResponse(data))
        ShowToast.success(data.message || 'Verified successfully!')
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || 'Submission failed!')
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
