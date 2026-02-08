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
import { Link } from "react-router-dom"

export const CustomerVerificationDetails = ({ goToNextStep, goToPrevStep }: CustomerVerificationDetailsProps) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerDetailsSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile_number: "",
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
    url: "verify/account",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
         goToNextStep?.()
        ShowToast.success(data.message || "Submitted successfully!")
      },
      onError: (error: any) => {
        ShowToast.error(
          error.response?.data?.message ||
          error.message ||
          "Submission failed!"
        )
      },
    },
  })

  const onSubmit = (data: CustomerFormValues) => {
    submitMutation.mutate(data)
  }

  return (
    <div className="max-w-full mx-auto border-0 bg-transparent">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Main Content - stack on mobile, side by side on md+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-10">
          {/* Car Image Section - hidden on mobile, visible on lg+ */}
          <div className="hidden lg:flex flex-col items-center justify-center w-full max-w-[580px] h-auto aspect-video">
            <h1 className="text-2xl xl:text-[32px] font-bold leading-none text-black text-center">
              Get Motor Insurance
            </h1>
            <img src="/car.png" alt="Car" className="w-full h-full object-contain rounded-xl" />
          </div>
          
          {/* Form Section */}
          <FieldGroup className="w-full">
            {/* Mobile Header - only visible on mobile */}
            <h1 className="lg:hidden text-xl sm:text-2xl font-bold leading-none text-black mb-4">
              Get Motor Insurance
            </h1>
            
            <h2 className="flex gap-1 flex-wrap font-poppins text-base sm:text-[20px] font-medium leading-none tracking-normal text-[#141414]">
              <span>Proceed to add your</span>
              <span className="text-[#C20C0C]">Details</span>
            </h2>
            
            {/* Form Fields - 1 col mobile, 2 col sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <ReuseableInput
                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="last_name"
                label="Last Name"
              />
              <ReuseableInput
                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <ReuseableInput
                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="mobile_number"
                label="Mobile Number"
                type="tel"
              />
            </div>
          </FieldGroup>
          
          {/* Navigation Buttons - full width on both columns */}
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
              type="button"
              className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
              rightIcon={<ArrowRightCircle />}
              onClick={()=>(goToNextStep?.())}
              >
              Next
            </Button>
          </CardFooter>
        </div>
        
        {/* Info Cards Section - stack on mobile, side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch mt-6">
          <Card className="h-auto sm:h-[178px] rounded-[10px] border border-[#D9D9D9] bg-[#DCFCE733]">
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 h-full">
              <div
                className="w-[54px] h-[54px] rounded-full border border-[#D9D9D9] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <CircleCheck className="w-5 h-5 text-[#C20C0C]" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="font-semibold leading-none">
                    Streamlined <span className="text-[#43A047]">Claims Support</span>
                  </h2>
                  <p className="text-sm">
                    Experience hassle-free claims processing with our dedicated support
                    team available 24/7. Familiarize yourself with your policy coverage
                    and keep necessary documentation ready. Our experts will guide you
                    through every step of the claims journey.
                  </p>
                </div>
                <Button
                  type="button"
                  fullWidth
                  className="bg-[#43A047] text-white hover:bg-[#388E3C] mt-2">
                  File a Claim
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-auto sm:h-[178px] rounded-[10px] border border-[#C7EED5]">
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 h-full">
              <div className="w-[54px] h-[54px] rounded-full border border-[#D9D9D9] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <ShieldCheck className="w-5 h-5 text-[#C20C0C]" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="leading-none">
                    Your <span className="text-[#ED1E26]">Privacy Matters</span>
                  </h2>
                  <p className="text-sm">
                    We collect and protect your personal information in compliance
                    with data protection regulations. Your data is encrypted,
                    securely stored, and used exclusively for insurance quote
                    generation and policy processing.
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <Checkbox
                    className="w-[15px] h-[15px] rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]" />
                  <label className="cursor-pointer text-sm">
                    I acknowledge and consent to the collection and processing of my
                    personal data as outlined in the <Link to="#" className="underline"> Privacy Policy</Link>
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
