/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card"
import { Button, ReuseableInput } from "@/dev/core"
import { ArrowLeftCircle, ArrowRightCircle, CircleCheck, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { ShowToast } from "@/utils/utils"
import { CustomerDetailsSchema } from "@/types/form-schema"
import type { CustomerFormValues } from "@/types/schema"
import { EMETHODS } from "@/utils/constatnts"
import { zodResolver } from "@hookform/resolvers/zod"
import { UseApiMutation } from "@/hooks/hooks"
import type { CustomerVerificationDetailsProps, SubmitResponse } from "@/types/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Link, useNavigate } from "react-router-dom"
import { extractErrorMessage } from "@/utils/helpers"
import { UseAuth } from "@/stores/auth-store"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { useState } from "react"
import { cn } from "@/lib/utils"

const inputClassName =
  "w-full min-w-0 h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]"

export const CustomerVerificationDetails = ({
  goToNextStep,
  goToPrevStep,
}: CustomerVerificationDetailsProps) => {
  const [isPolicy, setIsPolicy] = useState(false)
  const [showPolicyState, setShowPolicyState] = useState(false)
  const { setGuest } = UseAuth()
  const navigate = useNavigate()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerDetailsSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
    url: "guest/register",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        setGuest(data?.data)
        goToNextStep?.()
        ShowToast.success(data.message || "Submitted successfully!")
      },
      onError: (error: any) => {
        const status = error?.response?.status
        if (status === 409) {
          setTimeout(() => {
            ShowToast.info("Account already exists. Redirecting to login...")
          }, 2000)
          navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)
          return
        }
        const message = extractErrorMessage(error)
        ShowToast.error(message || "Submission failed!")
      },
    },
  })

  const onSubmit = (data: CustomerFormValues) => {
    if (isPolicy === true) {
      submitMutation.mutate(data)
    }
    setShowPolicyState(true)
  }
  return (
    <div className="w-full min-w-0 max-w-full mx-auto items-center justify-center px-1 sm:px-2 lg:px-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        <section className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12">
          <div className="hidden lg:flex flex-col items-center justify-center w-full min-w-0 px-2 sm:block">
            <h1 className="text-2xl xl:text-[32px] font-bold leading-tight text-black text-center mb-4 xl:mb-6">
              Motor Insurance
            </h1>
            <img
              src="/car.png"
              alt="Car"
              className="w-full max-w-md xl:max-w-lg h-auto object-contain rounded-xl"
            />
          </div>
          <FieldGroup className="w-full min-w-0 space-y-4 sm:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="lg:hidden text-xl sm:text-2xl md:text-[28px] font-bold leading-tight text-black text-center sm:text-left">
                Get Motor Insurance
              </h1>
              <h2 className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 font-poppins text-base sm:text-lg md:text-[20px] font-medium leading-snug tracking-normal text-[#141414] justify-center sm:justify-start">
                <span>Proceed to add your</span>
                <span className="text-[#C20C0C]">Details</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 sm:gap-4">
              <ReuseableInput
                className={inputClassName}
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                className={inputClassName}
                control={form.control}
                name="last_name"
                label="Last Name"
              />
              <ReuseableInput
                className={inputClassName}
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <ReuseableInput
                className={inputClassName}
                control={form.control}
                name="phone"
                label="Mobile Number"
                type="tel"
              />
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3 rounded-lg sm:rounded-none bg-[#f0fdf4]/50 sm:bg-transparent p-2 sm:p-0 -mx-1 sm:mx-0">
              <Checkbox
                id="motor-privacy-consent"
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setIsPolicy(true)
                    setShowPolicyState(false)
                  } else {
                    setIsPolicy(false)
                  }
                }}
                className="w-4 h-4 mt-0.5 shrink-0 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
              />
              <label
                htmlFor="motor-privacy-consent"
                className={cn(
                  "text-xs sm:text-sm leading-relaxed cursor-pointer min-w-0",
                  isPolicy ? "text-[#141414]" : "text-red-500",
                )}>
                I acknowledge and consent to the collection and processing of my
                personal data as outlined in the{" "}
                <Link to="#" className="underline underline-offset-2 hover:text-[#C20C0C]">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {showPolicyState && (
              <div
                role="alert"
                className="w-full rounded-lg bg-red-100 border border-red-200 p-2 sm:p-4">
                <span className="text-red-600 text-xs sm:text-sm font-semibold leading-relaxed">
                  Confirm terms and conditions below before you continue
                </span>
              </div>
            )}
          </FieldGroup>
        </section>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Button
            type="button"
            disabled
            className="w-full sm:w-auto min-h-11 rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10 px-6"
            leftIcon={<ArrowLeftCircle className="shrink-0" />}
            onClick={() => goToPrevStep?.()}>
            Previous
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto min-h-11 bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C] px-8"
            rightIcon={<ArrowRightCircle className="shrink-0" />}
            loading={submitMutation.isPending}>
            Next
          </Button>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-stretch">
          <Card className="rounded-[10px] border border-[#D9D9D9] bg-[#DCFCE733] h-full shadow-none hidden md:block">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5 md:p-5 h-full">
              <div className="flex justify-center sm:justify-start shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-13.5 md:h-13.5 rounded-full border border-[#D9D9D9] flex items-center justify-center">
                  <CircleCheck className="w-5 h-5 text-[#C20C0C]" />
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0 gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="font-semibold leading-snug text-base sm:text-lg">
                    Streamlined{" "}
                    <span className="text-[#43A047]">Claims Support</span>
                  </h2>
                  <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#141414]/80">
                    Experience hassle-free claims processing with our dedicated support
                    team available 24/7. Familiarize yourself with your policy coverage
                    and keep necessary documentation ready. Our experts will guide you
                    through every step of the claims journey.
                  </p>
                </div>
                <Link to='#'
                  className="hover:underline hover:text-[#C20C0C]">
                  File a Claim
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[10px] border border-[#C7EED5] h-full shadow-none">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5 md:p-5 h-full">
              <div className="flex justify-center sm:justify-start shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-13.5 md:h-13.5 rounded-full border border-[#D9D9D9] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#C20C0C]" />
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0 gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="leading-snug font-semibold text-base sm:text-lg">
                    Your{" "}
                    <span className="text-[#ED1E26]">Privacy Matters</span>
                  </h2>
                  <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#141414]/80">
                    We collect and protect your personal information in compliance
                    with data protection regulations. Your data is encrypted,
                    securely stored, and used exclusively for insurance quote
                    generation and policy processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </form>
    </div>
  )
}
