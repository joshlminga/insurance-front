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
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { Controller, useFormContext } from "react-hook-form"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card> & { showFooter?: boolean }) {
  const { control, formState: { errors } } = useFormContext()
  const hasError = !!errors.otp
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Verify Your Phone </CardTitle>
        <CardDescription>We’ve sent a 4-digit verification code to.</CardDescription>
      </CardHeader>
      <CardContent className={cn('text-center')}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="otp">Enter Verification code</FieldLabel>
            <Controller
              name="token"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <InputOTP
                    {...field}
                    maxLength={4}
                    id="token"
                    onChange={(value) => field.onChange(value)}>
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} aria-invalid={hasError} />
                      <InputOTPSlot index={1} aria-invalid={hasError} />
                      <InputOTPSlot index={2} aria-invalid={hasError} />
                      <InputOTPSlot index={3} aria-invalid={hasError} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldError errors={[errors.token as any]} />
                </div>
              )}
            />
            <FieldDescription>
              Enter the 4-digit code sent to your email.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
