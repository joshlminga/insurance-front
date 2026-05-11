/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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

export const CustomerVerificationDetails = ({ goToNextStep, goToPrevStep }: CustomerVerificationDetailsProps) => {
  const [isPolicy, setIsPolicy] = useState(false);
  const [showPolicyState, setShowPolicyState] = useState(false)
  const { setGuest } = UseAuth();
  const navigate = useNavigate();
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
        setGuest(data?.data);
        goToNextStep?.()
        ShowToast.success(data.message || "Submitted successfully!")
      },
      onError: (error: any) => {
        const status = error?.response?.status;
        if (status === 409) {
          setTimeout(() => {
            ShowToast.info("Account already exists. Redirecting to login...");
          }, 2000);
          navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`);
          return;
        }
        const message = extractErrorMessage(error);
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
    <div className="max-w-full mx-auto border-0 bg-transparent">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-10">
          <div className="hidden lg:flex flex-col items-center justify-center w-full max-w-145 h-auto aspect-video">
            <h1 className="text-2xl xl:text-[32px] font-bold leading-none text-black text-center">
              Get Motor Insurance
            </h1>
            <img src="/car.png" alt="Car" className="w-full h-full object-contain rounded-xl" />
          </div>
          <FieldGroup className="w-full">
            <h1 className="lg:hidden text-xl sm:text-2xl font-bold leading-none text-black mb-4">
              Get Motor Insurance
            </h1>
            <h2 className="flex gap-1 flex-wrap font-poppins text-base sm:text-[20px] font-medium leading-none tracking-normal text-[#141414]">
              <span>Proceed to add your</span>
              <span className="text-[#C20C0C]">Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="last_name"
                label="Last Name"
              />
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="phone"
                label="Mobile Number"
                type="tel"
              />
            </div>

            {showPolicyState && (
              <div className="bg-red-200 rounded-lg w-full p-4">
                <span className="text-red-500 font-semibold">Confirm terms and conditions below before you continue</span>
              </div>
            )}
          </FieldGroup>
          <CardFooter className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row justify-between gap-3 mt-1 px-0">
            <Button
              type="button"
              disabled
              className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
              leftIcon={<ArrowLeftCircle />}
              onClick={() => goToPrevStep?.()}>
              Previous
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
              rightIcon={<ArrowRightCircle />}
              loading={submitMutation.isPending}
            >
              Next
            </Button>
          </CardFooter>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card className="rounded-[10px] border border-[#D9D9D9] bg-[#DCFCE733] h-full">
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 md:p-5 h-full">
              <div className="flex justify-center sm:justify-start shrink-0">
                <div className="w-12 h-12 md:w-13.5 md:h-13.5 rounded-full border border-[#D9D9D9] flex items-center justify-center">
                  <CircleCheck className="w-5 h-5 text-[#C20C0C]" />
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="font-semibold leading-tight text-base md:text-lg">
                    Streamlined{" "}
                    <span className="text-[#43A047]">Claims Support</span>
                  </h2>
                  <p className="text-sm md:text-[15px] leading-relaxed wrap-break-word">
                    Experience hassle-free claims processing with our dedicated support
                    team available 24/7. Familiarize yourself with your policy coverage
                    and keep necessary documentation ready. Our experts will guide you
                    through every step of the claims journey.
                  </p>
                </div>
                <Button
                  type="button"
                  fullWidth
                  className="bg-[#43A047] text-white hover:bg-[#388E3C] mt-4 sm:mt-3" >
                  File a Claim
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[10px] border border-[#C7EED5] h-full">
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 md:p-5 h-full">
              <div className="flex justify-center sm:justify-start shrink-0">
                <div className="w-12 h-12 md:w-13.5 md:h-13.5 rounded-full border border-[#D9D9D9] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#C20C0C]" />
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="leading-tight font-semibold text-base md:text-lg">
                    Your{" "}
                    <span className="text-[#ED1E26]">Privacy Matters</span>
                  </h2>
                  <p className="text-sm md:text-[15px] leading-relaxed wrap-break-word">
                    We collect and protect your personal information in compliance
                    with data protection regulations. Your data is encrypted,
                    securely stored, and used exclusively for insurance quote
                    generation and policy processing.
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-4 sm:mt-3">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setIsPolicy(true);
                        setShowPolicyState(false);
                      } else {
                        setIsPolicy(false);
                      }
                    }}
                    className={`w-4 h-4 rounded-[3px] border border-[#D9D9D9] mt-0.5 shrink-0 data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]`}
                  />
                  <label className={`${isPolicy ? 'cursor-pointer text-sm leading-relaxed wrap-break-word' : 'text-red-500'}`}>
                    I acknowledge and consent to the collection and processing of my
                    personal data as outlined in the
                    <Link to="#" className="underline ml-1">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
