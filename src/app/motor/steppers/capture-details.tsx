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
import type { SubmitResponse } from "@/types/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router-dom"

export const CustomerVerificationDetails = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="flex flex-col items-center justify-center w-[581px] h-[359px]">
            <h1 className="text-[32px] font-bold leading-none text-black">
              Get Motor Insurance
            </h1>
            <img src="/car.png" alt="Car" className="w-full h-full object-contain rounded-xl" />
          </div>
          <FieldGroup>
            <h1 className="flex gap-1 font-poppins text-[20px] font-medium leading-none tracking-normal text-[#141414]">
              <span>Proceed to add your</span>
              <span className="text-[#C20C0C]">Details</span>
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <ReuseableInput
                className="w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                className="w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="last_name"
                label="Last Name"
              />
              <ReuseableInput
                className="w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <ReuseableInput
                className="w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="mobile_number"
                label="Mobile Number"
                type="tel"
              />
            </div>
          </FieldGroup>
          <CardFooter className="md:col-span-2 flex justify-between mt-1">
            <Button
              type="button"
              className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
              leftIcon={<ArrowLeftCircle />}>
              Previous
            </Button>

            <Button
              type="submit"
              className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
              rightIcon={<ArrowRightCircle />}
              loading={submitMutation.isPending}>
              Next
            </Button>
          </CardFooter>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center mt-6">
          <Card className="h-[178px] rounded-[10px] border border-[#D9D9D9] bg-[#DCFCE733]">
            <CardContent className="flex gap-4 p-4 h-full">
              <div
                className="w-[54px] h-[54px] rounded-full border border-[#D9D9D9] flex items-center justify-center shrink-0">
                <CircleCheck className="w-5 h-5 text-[#C20C0C]" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-2">
                  <h2 className="font-semibold leading-none">
                    Streamlined <span className="text-[#43A047]">Claims Support</span>
                  </h2>
                  <p>
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

          <Card className="h-[178px] rounded-[10px] border border-[#C7EED5]">
            <CardContent className="flex gap-4 p-4 h-full">
              <div className="w-[54px] h-[54px] rounded-full border border-[#D9D9D9] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C20C0C]" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-2">
                  <h2 className="leading-none">
                    Your <span className="text-[#ED1E26]">Privacy Matters</span>
                  </h2>
                  <p>
                    We collect and protect your personal information in compliance
                    with data protection regulations. Your data is encrypted,
                    securely stored, and used exclusively for insurance quote
                    generation and policy processing.
                  </p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <Checkbox
                    className="w-[15px] h-[15px] rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]" />
                  <label className="cursor-pointer max-w-[449px]">
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
