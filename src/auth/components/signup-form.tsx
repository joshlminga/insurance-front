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
        ShowToast.success(data.message || "Login successful!")
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || "Login failed!"
        ShowToast.error(errorMessage)
      }
    }
  })

  const onSubmit = async (data: SignUpFormValues) => {
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
            {/* <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              required
            /> */}
          </Field>
          <Field>
            <Button className="bg-[#C20C0C] hover:bg-[#C20C0C]/70" type="submit">Create Account</Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
