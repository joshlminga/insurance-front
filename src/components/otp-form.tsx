/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { Controller, useFormContext } from "react-hook-form"

export function OTPForm({
  onComplete,
  title = "Verify Your Account",
  description = "We've sent a 4-digit verification code to your phone.",
  showFooter = true,
  ...props
}: React.ComponentProps<typeof Card> & {
  showFooter?: boolean
  onComplete?: (value: string) => void
  title?: string
  description?: string
}) {
  const { control, formState: { errors } } = useFormContext()
  const hasError = !!errors.token

  return (
    <Card {...props} className={cn("w-full border-0 shadow-none bg-transparent text-center", props.className)}>
      <CardHeader className="flex flex-col items-center text-center space-y-1.5">
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <FieldGroup className="items-center">
          <Field className="items-center text-center">
            <h1 className="">Enter Verification code</h1>
            <Controller
              name="token"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col items-center gap-2 w-full">
                  <InputOTP
                    {...field}
                    maxLength={4}
                    id="token"
                    onChange={(value) => field.onChange(value)}
                    onComplete={(value) => {
                      field.onChange(value)
                      onComplete?.(value)
                    }}>
                    <InputOTPGroup className="justify-center gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} aria-invalid={hasError} />
                      <InputOTPSlot index={1} aria-invalid={hasError} />
                      <InputOTPSlot index={2} aria-invalid={hasError} />
                      <InputOTPSlot index={3} aria-invalid={hasError} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldError errors={[errors.token as any]} className="text-center" />
                </div>
              )}
            />
            <FieldDescription className="text-center">
              Enter the 4-digit code sent to your phone.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
