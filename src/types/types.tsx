/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import type { Control, FieldValues, Path } from "react-hook-form";

export type T = {
  [key: string]: any;
  ReactNode?: ReactNode;
}

export type TNodeChildrentType<T = ReactNode> = {
    children: T;
};

export type TReusablePageProps = {
    description?: string;
    title: string;
} & Partial<TNodeChildrentType>;

export interface PageHeaderAction {
    label: string
    icon?: LucideIcon
    href?: string
    onClick?: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
}

export interface PageHeaderProps {
    title: string
    description?: string
    actions?: PageHeaderAction[]
    children?: React.ReactNode
}
export interface Tuser {
    name: string
    email: string
    avatar?: string
}

export type StepItem = {
  title?: string
  content: ReactNode
}

export type ReusableStepperProps = {
  steps: StepItem[]
  defaultStep?: number
  className?: string
}
export interface ButtonProps extends React.ComponentProps<typeof ShadButton> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export type RHFInputProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  id?: string
  placeholder?: string
  type?: string
  autoComplete?: string
  required?: boolean
}