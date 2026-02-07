import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { FcGoogle } from "react-icons/fc"
import { ReuseableInput } from "@/dev/core"
import { EMETHODS } from "@/utils/constatnts"
import { UseAuth } from "@/components/auth-provider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UseApiMutation } from "@/hooks/hooks"
import { ShowToast } from "@/utils/utils"

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
      <form>
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
            <ReuseableInput
              className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
              control={form.control}
              name="email"
              label="Email"
              type="email"
            />
            <ReuseableInput
              className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
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
        Don&apos;t have an account?  <a href={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}>Sign UP</a>
      </FieldDescription>
    </div>
  )
}
