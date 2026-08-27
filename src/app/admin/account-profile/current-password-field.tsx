import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { ReuseableInput } from "@/dev/core"

type CurrentPasswordFieldProps<T extends FieldValues> = {
  control: Control<T>
  /** Field name on the form — usually "current_password" */
  name: FieldPath<T>
  label?: string
  placeholder?: string
  required?: boolean
}

/**
 * Password input with show/hide toggle.
 * Reused on all Account Profile segments so we don't copy the eye-button markup.
 * (Think of it like a Blade partial for a password field.)
 */
export function CurrentPasswordField<T extends FieldValues>({
  control,
  name,
  label = "Current Password",
  placeholder = "Enter your current password",
  required = true,
}: CurrentPasswordFieldProps<T>) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <ReuseableInput
        control={control}
        name={name}
        label={label}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        autoComplete="current-password"
        className="w-full h-10 rounded-[5px] border border-[#ADABAB] pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
