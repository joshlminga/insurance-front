/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import type { Control, FieldValues, Path } from "react-hook-form";
import { type AxiosRequestConfig, type Method } from 'axios'
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

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

export interface ProtectedRouteProps {
  children: React.ReactNode
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
  content: React.ComponentType<{
    goToNextStep: () => void
    goToPrevStep: () => void
  }>
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
  control?: Control<T>
  name: Path<T>
  label: string
  id?: string
  placeholder?: string
  type?: string
  autoComplete?: string
  required?: boolean
  className?:string
}

export interface AuthProviderState {
  user: Tuser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: Tuser, token: string) => void
  logout: () => void
  updateUser: (user: Partial<Tuser>) => void
}
export interface AuthProviderProps {
  children: ReactNode
  storageKey?: string
}

export const initialState: AuthProviderState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => null,
  logout: () => null,
  updateUser: () => null,
}

export interface UseApiQueryOptions<TData = unknown> {
  url: string
  params?: Record<string, any>
  config?: AxiosRequestConfig
  queryOptions?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
}

export interface UseApiMutationOptions<TData = unknown, TVariables = unknown, TContext = unknown> {
  url: string | ((variables: TVariables) => string)
  method?: Method
  config?: AxiosRequestConfig
  invalidateQueries?: string[]
  mutationOptions?: Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn'>
}
export interface ToastOptions {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  duration?: number
}

export interface SubmitResponse {
    message:string
}
export interface CustomerVerificationDetailsProps {
  goToNextStep?: () => void
  goToPrevStep?: () => void
}

export type TTabItem = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
  iconSize?: number
  component: React.ComponentType<any>
  disabled?: boolean
}

export type TTabsProps = {
  tabs: TTabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabsListClassName?: string
  triggerClassName?: string
  contentClassName?: string
} & Record<string, any>

export type TSelectOption = {
  label: string
  value: string
  disabled?: boolean
}
export type TRHFSelectProps<T extends FieldValues> = {
  control: any
  name: Path<T>
  label?: string
  placeholder?: string
  options: TSelectOption[]
  required?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

export type CheckboxOption = {
  id: string
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export type ReusableCheckboxGridProps = {
  options: CheckboxOption[]
  columns?: number
  className?: string
}

export type ReusablePaginationProps = {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    siblingCount?: number
    disabled?: boolean
}
