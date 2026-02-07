/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { EPREFIX, EROUTES } from "@/utils/enums"

import { ReuseableInput } from "@/dev/core"
import { EMETHODS } from "@/utils/constatnts"
import { UseAuth } from "@/components/auth-provider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/types/form-schema"
import { type LoginFormValues } from "@/types/schema"
import { UseApiMutation } from "@/hooks/hooks"
import { ShowToast } from "@/utils/utils"
import type { LoginResponse } from "@/types/types"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { login } = UseAuth()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const loginMutation = UseApiMutation<LoginResponse, LoginFormValues>({
    url: 'login',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: LoginResponse) => {
        ShowToast.success(data.message || "Login successful!")
        login(data.user, data.access_token)
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || "Login failed!"
        ShowToast.error(errorMessage)
      }
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      loginMutation.mutate(data)
    } catch (error) {
      console.log(error);
      ShowToast.error("Login failed!")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
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
          </Field>
          <Field>
            <Button
              {...{
                onClick: () =>
                  console.log()
              }}
              className="bg-[#C20C0C] hover:bg-[#C20C0C]/70"
              type="submit">
              <p className='font-bold leading-6 text-sm'>Login</p>
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription>
        Don&apos;t have an account?  <a href={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}>Sign Up</a>
      </FieldDescription>
    </div>
  )
}
