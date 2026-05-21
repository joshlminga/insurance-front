/* eslint-disable @typescript-eslint/no-explicit-any */
import { OTPForm } from '@/components/otp-form';
import { Field } from '@/components/ui/field';
import { Button } from '@/dev/core';
import { UseApiMutation } from '@/hooks/hooks';
import { cn } from '@/lib/utils';
import { UseAuth } from '@/stores/auth-store';
import { OTPVerificationSchema } from '@/types/form-schema';
import { OTPFormValues } from '@/types/schema';
import { LoginResponse } from '@/types/types';
import { EMETHODS } from '@/utils/constatnts';
import { extractErrorMessage } from '@/utils/helpers';
import { ShowToast } from '@/utils/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form';

export function OtpVerificationAuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, guest } = UseAuth();

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(OTPVerificationSchema),
    defaultValues: {
      token: "",
      token_type: "email_verification",
      token_name: guest?.verification?.phone?.verification_token_name
    },
  })

  const submitMutation = UseApiMutation<LoginResponse, OTPFormValues>({
    url: "auth/account-verification",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        login(data.user, data.access_token, data.is_general)
        ShowToast.success(data.message || "Verified successfully!")
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error);
        ShowToast.error(message || "Submission failed!")
      },
    },
  })

  const onSubmit = (data: OTPFormValues) => {
    submitMutation.mutate(data)
  }

  return (
    <FormProvider {...form}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-start min-h-125 w-full">
          <div className="w-full max-w-xl border border-[#D9D9D9] rounded-2xl p-8 bg-white shadow-sm">
            <div className="flex flex-col gap-6">
              <OTPForm className="border-0 shadow-none bg-transparent" />
            </div>
            <Field>
              <Button
                className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                type="submit"
                loading={submitMutation.isPending}>
                <span className="font-semibold text-sm">Verify OTP</span>
              </Button>
            </Field>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
