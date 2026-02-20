/* eslint-disable @typescript-eslint/no-explicit-any */
import { OTPForm } from "@/components/otp-form";
import { CardFooter } from "@/components/ui/card"
import { Button } from "@/dev/core"
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react"
import { Link } from "react-router-dom"
import type { CustomerVerificationDetailsProps, SubmitResponse } from "@/types/types"
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EMETHODS } from "@/utils/constatnts";
import { ShowToast } from "@/utils/utils";
import { UseApiMutation } from "@/hooks/hooks";
import { OTPVerificationSchema } from "@/types/form-schema";
import type { OTPFormValues, ResendOTPFormValues } from "@/types/schema";
import { extractErrorMessage } from "@/utils/helpers";
import { UseAuth } from "@/components/auth-provider";

export default function OTPVerificationPage({ goToNextStep, goToPrevStep }: CustomerVerificationDetailsProps) {
  const { guest } = UseAuth();
  const methods = useForm<OTPFormValues>({
    resolver: zodResolver(OTPVerificationSchema),
    defaultValues: {
      token: "",
      token_type: guest?.verification?.phone?.verification_token_type,
      token_name: guest?.verification?.phone?.verification_token_name
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, OTPFormValues>({
    url: "auth/account-verification",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        goToNextStep?.()
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

  const resendMutation = UseApiMutation<SubmitResponse, ResendOTPFormValues>({
    url: "auth/account-verification/retry",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Token Resend successfully!")
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error);
        ShowToast.error(message || "Submission failed!")
      },
    },
  })

  const resendOtp = () => {
    const payload: ResendOTPFormValues = {
      type: 'guest',
      id: Number(guest?.guestId),
      token_type: String(guest?.verification?.phone?.verification_token_type),
      token_name: String(guest?.verification?.phone?.verification_token_name),
    }
    resendMutation.mutate(payload)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col items-center justify-start min-h-[500px] w-full">
        <div className="w-full max-w-xl border border-[#D9D9D9] rounded-2xl p-8 bg-white shadow-sm">
          <div className="flex flex-col gap-6">
            <OTPForm className="border-0 shadow-none bg-transparent" showFooter={false} />
            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  resendOtp();
                }}
                className="text-[#C20C0C] font-semibold underline"
              >
                Resend
              </Link>
            </p>
          </div>
        </div>
        <CardFooter className="w-full md:col-span-2 flex justify-between mt-1">
          <Button
            type="button"
            className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            leftIcon={<ArrowLeftCircle />}
            onClick={() => goToPrevStep?.()}>
            Previous
          </Button>
          <Button
            type="submit"
            className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
            rightIcon={<ArrowRightCircle />}
            loading={submitMutation.isPending}
          //  onClick={() => goToNextStep?.()}
          >
            Verify & Proceed
          </Button>
        </CardFooter>
      </form>
    </FormProvider>
  )
}