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
import { Checkbox } from "@/components/ui/checkbox";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPolicy, setIsPolicy] = useState(false)
  const [showPolicyState, setShowPolicyState] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  // const returnTo = (location.state as any)?.returnTo
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
        // navigate(returnTo || EROUTES.LANDING)
        navigate(`/${EPREFIX.AUTH}${EROUTES.VERIFY_EMAIL}`)
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error);
        ShowToast.error(message || "Signup failed!")
      }
    }
  })

  const onSubmit = async (data: SignUpFormValues) => {
    if (isPolicy === true) {
      loginMutation.mutate(data)
    }
    setShowPolicyState(true)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field className="py-4">
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="first_name"
                label="First Name"
                placeholder="Enter first name"
              />
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="last_name"
                label="Last Name"
                placeholder="Enter last name"
              />
            </div>
            <ReuseableInput
              className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter email address"
            />
            <div className="relative items-center justify-center">
              <ReuseableInput
                className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                control={form.control}
                name="password"
                label="Password"
                type={show ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
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
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                aria-label={showConfirm ? "Hide password" : "Show password"}>
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3 rounded-lg sm:rounded-none bg-[#f0fdf4]/50 sm:bg-transparent p-2 sm:p-0 -mx-1 sm:mx-0">
              <Checkbox
                id="motor-privacy-consent"
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setIsPolicy(true)
                    setShowPolicyState(false)
                  } else {
                    setIsPolicy(false)
                  }
                }}
                className="w-4 h-4 mt-0.5 shrink-0 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:bg-[#C20C0C] data-[state=checked]:border-[#C20C0C]"
              />
              <label
                htmlFor="motor-privacy-consent"
                className={cn(
                  "text-xs sm:text-sm leading-relaxed cursor-pointer min-w-0",
                  isPolicy ? "text-[#141414]" : "text-red-500",
                )}>
                I acknowledge and consent to the collection and processing of my
                personal data as outlined in the{" "}
                <Link to="#" className="underline underline-offset-2 hover:text-[#C20C0C]">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {showPolicyState && (
              <div
                role="alert"
                className="w-full rounded-lg bg-red-100 border border-red-200 p-2 sm:p-4">
                <span className="text-red-600 text-xs sm:text-sm font-semibold leading-relaxed">
                  Confirm terms and conditions below before you continue
                </span>
              </div>
            )}
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
          className="text-sm text-[#C20C0C] hover:underline"
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
