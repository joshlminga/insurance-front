/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { useNavigate, useLocation, Link } from "react-router-dom"

import { Button, ReuseableInput } from "@/dev/core"
import { EMETHODS } from "@/utils/constatnts"
import { UseAuth } from "@/stores/auth-store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/types/form-schema"
import { type LoginFormValues } from "@/types/schema"
import { UseApiMutation } from "@/hooks/hooks"
import { ShowToast } from "@/utils/utils"
import type { LoginResponse } from "@/types/types"
import { normalizeLoginResponse } from '@/auth/session'
import { extractErrorMessage } from "@/utils/helpers"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [show, setShow] = useState(false);
  const { setSession, setGuest } = UseAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as any)?.returnTo
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const loginMutation = UseApiMutation<LoginResponse, LoginFormValues>({
    url: 'auth/login',
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data: LoginResponse) => {
        if (data?.data?.status === 'NOT_VERIFIED') {
          setGuest(data?.data?.guest);
          ShowToast.info(data.message || "Please verify your email to continue.")
          navigate(`/${EPREFIX.AUTH}${EROUTES.VERIFY_EMAIL}`);
          return;
        }
        ShowToast.success(data.message || "Login successful!")
        setSession(normalizeLoginResponse(data))
        if (returnTo) {
          navigate(returnTo)
        } else if (data.is_general) {
          navigate(EROUTES.LANDING)
        } else {
          navigate(EROUTES.DASHBOARD);
        }
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error);
        ShowToast.error(message || "Login failed!")
      }
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      loginMutation.mutate(data)
    } catch (error: any) {
      ShowToast.error(extractErrorMessage(error?.message || "Login failed!"))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Field>
            <ReuseableInput
              className="w-full h-12 rounded-md border border-gray-300"
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter email address"
            />
          </Field>
          <Field className="flex flex-col gap-1">
            <div className="flex items-center justify-end">
              <Link
                to={`/${EPREFIX.AUTH}${EROUTES.FORGOT_PASSWORD}`}
                className="text-sm text-[#C20C0C] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <ReuseableInput
                className="w-full h-12 rounded-md border border-gray-300 pr-10"
                control={form.control}
                name="password"
                label="Password"
                type={show ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>
          <Field>
            <Button
              className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
              type="submit"
              loading={loginMutation.isPending}>
              <span className="font-semibold text-sm">Login</span>
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          to={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}
          className="text-[#C20C0C] font-medium hover:underline"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`, {
              state: location.state,
            });
          }}>
          Sign Up
        </Link>
      </FieldDescription>
    </div>
  );

}
