/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { UseApiMutation } from "@/hooks/hooks";
import { ShowToast } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { EMETHODS } from "@/utils/constatnts";
import { ReuseableInput } from "@/dev/core";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { SignUpSchema } from "@/types/form-schema";
import { type SignUpFormValues } from "@/types/schema";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const loginMutation = UseApiMutation<SignUpFormValues>({
    url: 'signup',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: any) => {
        ShowToast.success(data.message || "Signup successful!")
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || "Signup failed!"
        ShowToast.error(errorMessage)
      }
    }
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      loginMutation.mutate(data)
    } catch (error) {
      console.log(error);
      ShowToast.error("Signup failed!")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-bold text-xl text-[#C20C0C]">
              <span>Please sign in or register</span>
            </div>
            <h1 className="text-xl font-bold">to purchase your cover </h1>
          </div>
          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              {...{
                onClick: () =>
                  console.log()
              }}
              type="button"
              variant="outline">
              <FcGoogle
                {...{
                  size: 20,
                }}
              />
              <p className='font-bold leading-6 text-sm'>Continue with Google</p>
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <div className="">
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
                name="password"
                label="Password"
                type="password"
              />
              <ReuseableInput
                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                control={form.control}
                name="confirm_password"
                label="Confirm Password"
                type="password"
              />
            </div>
          </Field>
          <Field>
            <Button
              className="bg-[#C20C0C] hover:bg-[#C20C0C]/70"
              type="submit">
              <p className='font-bold leading-6 text-sm'>Create Account</p>
            </Button>

          </Field>
        </FieldGroup>
      </form>
      <FieldDescription>
        Already have an account? <a href={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}>Sign In</a>
      </FieldDescription>
    </div>
  )
}
