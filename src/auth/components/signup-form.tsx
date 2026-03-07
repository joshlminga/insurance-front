/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"

import { useForm } from "react-hook-form";
import { UseApiMutation } from "@/hooks/hooks";
import { ShowToast } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { EMETHODS } from "@/utils/constatnts";
import { Button, ReuseableInput } from "@/dev/core";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { SignUpSchema } from "@/types/form-schema";
import { type SignUpFormValues } from "@/types/schema";
import { extractErrorMessage } from "@/utils/helpers";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="last_name"
                label="Last Name"
              />
            </div>
            <ReuseableInput
              className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
              control={form.control}
              name="email"
              label="Email"
              type="email"
            />
            <div className="relative items-center justify-center">
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="password"
                label="Password"
                type={show ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-12 text-slate-500 hover:text-slate-700"
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative items-center justify-center">
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="confirm_password"
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-12 text-slate-500 hover:text-slate-700"
                aria-label={showConfirm ? "Hide password" : "Show password"}>
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

          </Field>
          <Field>
            <Button
              className="bg-[#C20C0C] hover:bg-[#C20C0C]/70"
              type="submit"
              loading={loginMutation.isPending}>
              <p className='font-bold leading-6 text-sm'>Create Account</p>
            </Button>

          </Field>
        </FieldGroup>
      </form>
      <FieldDescription>
        Already have an account?
        <Link to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`, { state: location.state })
          }}>
          Sign In
        </Link>
      </FieldDescription>
    </div>
  )
}
