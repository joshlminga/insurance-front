/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"

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
import { extractErrorMessage } from "@/utils/helpers";
import { useNavigate, useLocation } from "react-router-dom";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as any)?.returnTo
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  })

  const loginMutation = UseApiMutation<SignUpFormValues>({
    url: 'guest/register',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: any) => {
        ShowToast.success(data.message || "Signup successful!")
         navigate(returnTo || EROUTES.LANDING)
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error);
        ShowToast.error(message || "Signup failed!")
      }
    }
  })

  const onSubmit = async (data: SignUpFormValues) => {
    loginMutation.mutate(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field className="py-4">
            <div className="grid grid-cols-2 gap-3">
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
            </div>
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
        Already have an account? <a href={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`} onClick={(e) => { e.preventDefault(); navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`, { state: location.state }) }}>Sign In</a>
      </FieldDescription>
    </div>
  )
}
