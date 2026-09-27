/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Button, ReuseableInput } from "@/dev/core"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShowToast } from "@/utils/utils"
import { UseApiMutation } from "@/hooks/hooks"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { Link, useNavigate } from "react-router-dom"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { ForgotPasswordValues } from "@/types/schema"
import { ForgotPasswordSchema } from "@/types/form-schema"
import { UseAuth } from "@/stores/auth-store"
import { useState } from "react"
import type { Guest } from "@/types/types"

type RequestVerificationResponse = {
  success?: boolean
  message?: string
  data?: {
    status?: string
    code?: string
    type?: string
    id?: number
    guestId?: number
    verification?: Guest["verification"]
    guest?: Guest & { email?: string }
  }
}

const RequestVerificationForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const navigate = useNavigate()
  const { setGuest } = UseAuth()
  // result: form | already_active | code_sent | inactive
  const [result, setResult] = useState<
    "form" | "already_active" | "code_sent" | "inactive" | "acknowledged"
  >("form")

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const mutation = UseApiMutation<RequestVerificationResponse, ForgotPasswordValues>({
    url: "auth/account-verification/request",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        const status = data?.data?.status

        if (status === "ALREADY_ACTIVE") {
          ShowToast.info(data.message || "Your account is already active. Please sign in.")
          setResult("already_active")
          return
        }

        if (status === "CODE_SENT") {
          // Store guest/user context so /auth/verify-email can submit or resend OTP
          const guestPayload = data.data?.guest
          if (guestPayload?.guestId && guestPayload.verification) {
            setGuest({
              guestId: guestPayload.guestId,
              verification: guestPayload.verification,
            })
          } else if (data.data?.type === "guest" && data.data.guestId && data.data.verification) {
            setGuest({
              guestId: data.data.guestId,
              verification: data.data.verification,
            })
          } else if (data.data?.type === "user" && data.data.verification) {
            // User OTP: keep verification meta on guest slot for the OTP form defaults
            setGuest({
              guestId: data.data.id ?? 0,
              verification: data.data.verification,
            })
          }

          ShowToast.success(data.message || "Verification code sent.")
          setResult("code_sent")
          navigate(`/${EPREFIX.AUTH}${EROUTES.VERIFY_EMAIL}`)
          return
        }

        ShowToast.info(data.message || "If an account needs verification, a code has been sent.")
        setResult("acknowledged")
      },
      onError: (error: any) => {
        const code = error?.response?.data?.data?.code
        const message = extractErrorMessage(error)

        if (code === "ACCOUNT_INACTIVE" || error?.response?.status === 403) {
          ShowToast.error(message || "Your account is not active. Please contact your administrator.")
          setResult("inactive")
          return
        }

        ShowToast.error(message || "Something went wrong")
      },
    },
  })

  const onSubmit = (data: ForgotPasswordValues) => {
    mutation.mutate(data)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {result === "form" && (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <FieldDescription className="text-sm text-gray-500">
              Enter the email you used to register. We will send a verification
              code if your account still needs to be verified.
            </FieldDescription>
            <Field>
              <ReuseableInput
                className="w-full h-12 rounded-md border border-gray-300"
                control={form.control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
              />
            </Field>
            <Field>
              <Button
                className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                type="submit"
                loading={mutation.isPending}>
                <span className="font-semibold text-sm">
                  Send Verification Code
                </span>
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {result === "already_active" && (
        <FieldGroup className="flex flex-col gap-4 text-center">
          <FieldDescription className="text-base font-medium text-gray-800">
            Account already active
          </FieldDescription>
          <FieldDescription className="text-sm text-gray-500">
            Your account is already active. Please sign in to continue.
          </FieldDescription>
          <Field>
            <Button
              className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
              onClick={() => navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)}>
              <span className="font-semibold text-sm">Go to Sign In</span>
            </Button>
          </Field>
        </FieldGroup>
      )}

      {result === "inactive" && (
        <FieldGroup className="flex flex-col gap-4 text-center">
          <FieldDescription className="text-base font-medium text-gray-800">
            Account not active
          </FieldDescription>
          <FieldDescription className="text-sm text-gray-500">
            Your account has been deactivated. Please contact your administrator
            to reactivate it.
          </FieldDescription>
          <Field>
            <Button
              className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
              onClick={() => navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)}>
              <span className="font-semibold text-sm">Back to Sign In</span>
            </Button>
          </Field>
        </FieldGroup>
      )}

      {result === "acknowledged" && (
        <FieldGroup className="flex flex-col gap-4 text-center">
          <FieldDescription className="text-base font-medium text-gray-800">
            Check your email
          </FieldDescription>
          <FieldDescription className="text-sm text-gray-500">
            If an account needs verification, a code has been sent to that email.
          </FieldDescription>
          <Field>
            <Button
              className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
              onClick={() => navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)}>
              <span className="font-semibold text-sm">Back to Sign In</span>
            </Button>
          </Field>
        </FieldGroup>
      )}

      {result === "form" && (
        <FieldDescription className="text-center text-sm">
          Remembered your password?{" "}
          <Link
            to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
            className="text-[#C20C0C] font-medium hover:underline"
            onClick={(e) => {
              e.preventDefault()
              navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)
            }}>
            Back to Login
          </Link>
        </FieldDescription>
      )}
    </div>
  )
}

export default RequestVerificationForm
