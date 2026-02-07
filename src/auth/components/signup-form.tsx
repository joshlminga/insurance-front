import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-bold text-xl text-[#C20C0C]">
              <span>Please sign in or register</span>
            </div>
            <h1 className="text-xl font-bold">to purchase your cover </h1>
            {/* <FieldDescription>
              Already have an account? <a href="#">Sign in</a>
            </FieldDescription> */}
          </div>
          <Field className="grid gap-4 sm:grid-cols-1">
            <Button variant="outline" type="button">
             <FcGoogle size={20} />
              Continue with Google
            </Button>
          </Field>
           <FieldSeparator>Or</FieldSeparator>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Create Account</Button>
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
