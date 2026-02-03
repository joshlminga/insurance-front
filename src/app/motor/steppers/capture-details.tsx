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

export const UserDetails = () => {

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerDetailsSchema),
    defaultValues: {
      email: "",
    },
  })
  const submitMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
    url: 'verify/account',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: SubmitResponse) => {
        ShowToast.success(data.message || "Submitted successful!")
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || "Login failed!"
        ShowToast.error(errorMessage)
      }
    }
  })

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      submitMutation.mutate(data)
    } catch (error) {
      console.log(error);
      ShowToast.error("Login failed!")
    }
  }


  return (
    <Card className="max-w-full mx-auto ">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <img src="/car.png" alt="Car" className="w-full h-auto rounded-xl" />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
            />
             <ReuseableInput
              control={form.control}
              name="mobile_number"
              label="Mobile Number"
            />
          </FieldGroup>
        </form>

        <CardFooter className="md:col-span-2 flex justify-between mt-4">
          <Button
            className="bg-[#C20C0C]"
            children={'Previous'}
            leftIcon={<ArrowLeft />}
          />
          <Button
            className="bg-[#C20C0C]"
            children={'Next'}
            rightIcon={<ArrowRight />}
          />
        </CardFooter>
      </CardContent>
    </Card>
  )
}
