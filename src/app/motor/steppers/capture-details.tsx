import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button, ReuseableInput } from "@/dev/core"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { ShowToast } from "@/utils/utils"
import { CustomerDetailsSchema } from "@/types/form-schema"
import type { CustomerFormValues } from "@/types/schema"
import { EMETHODS } from "@/utils/constatnts"
import { zodResolver } from "@hookform/resolvers/zod"
import { UseApiMutation } from "@/hooks/hooks"
import type { SubmitResponse } from "@/types/types"

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
    <Card className="max-w-full mx-auto">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="flex items-center">
            <img
              src="/car.png"
              alt="Car"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          <FieldGroup>
            <h1 className="flex">
              <span>Proceed to add your</span> <span className="text-[#C20C0C]">Details</span>
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <ReuseableInput
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                control={form.control}
                name="last_name"
                label="Last Name"
              />
              <ReuseableInput
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <ReuseableInput
                control={form.control}
                name="mobile_number"
                label="Mobile Number"
                type="tel"
              />
            </div>
          </FieldGroup>
          <CardFooter className="md:col-span-2 flex justify-between mt-4">
            <Button
              type="button"
              className="bg-[#C20C0C]"
              leftIcon={<ArrowLeft />}>
              Previous
            </Button>

            <Button
              type="submit"
              className="bg-[#C20C0C]"
              rightIcon={<ArrowRight />}
              loading={submitMutation.isPending}>
              Next
            </Button>
          </CardFooter>
        </CardContent>
      </form>
    </Card>
  )
}
