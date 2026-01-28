import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface BaseFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  className?: string
  description?: string
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "date"
  placeholder?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
  rows?: number
}

interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function FormField({
  label,
  name,
  error,
  required,
  className,
  description,
  ...props
}: InputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={!!error}
        {...props}
      />
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function TextareaField({
  label,
  name,
  error,
  required,
  className,
  description,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={!!error}
        {...props}
      />
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function SelectField({
  label,
  name,
  error,
  required,
  className,
  description,
  options,
  placeholder = "Select an option",
  value,
  onChange,
  disabled,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={name} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  )
}
