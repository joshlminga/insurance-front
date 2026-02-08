/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import type { Control, FieldValues, Path } from "react-hook-form";
import { type AxiosRequestConfig, type Method } from 'axios'
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { SORT_ORDER } from "@/utils/enums";

export type T = {
  [key: string]: any;
  ReactNode?: ReactNode;
}

export interface StepperContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}
export interface StepperProviderProps {
  children: ReactNode;
}
export interface ReusableStepperProps {
    steps: {
        title: string
        content: React.FC<{ goToNextStep: () => void; goToPrevStep: () => void }>
    }[]
    defaultStep?: number
    className?: string
    value?: number
    onValueChange?: (value: number) => void
}
export interface LoginResponse {
  message: string
  user: any
  access_token: string
}

export type TNodeChildrentType<T = ReactNode> = {
  children: T;
};
export type TPaginationFilters = { page: number; pageSize: number };

export type TActionType<S> = {
  payload: Partial<S>;
  type: keyof S;
};

export type TFilterOptions = {
  order: {
    direction: SORT_ORDER;
    orderField: string;
  };
  date: Date[];
  term: string;
} & Record<string, any>;

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
  className?: string
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
  message: string
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

export type CardHeaderContent =
  | { type: 'image'; src: string; alt?: string; className?: string }
  | { type: 'text'; title: string; description?: string; className?: string }
  | { type: 'custom'; node: ReactNode }

export type ReusableCardProps = {
  header?: CardHeaderContent
  children: ReactNode
  footer?: ReactNode
  rootClassName?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string,
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export type TNavBarUrlType = {
  child_urls?: Pick<
    TNavBarUrlType,
    'Icon' | 'child_urls' | 'is_enabled' | 'label' | 'url'
  >[];
  // user_info: TOKEN_USER_INFO;
  Icon?: React.FC<LucideIcon>;
  current_path: string;
  is_enabled: boolean;
  label: string;
  url?: string;
};

export type TComponent<T = TKeyValueStringType> = {
  Component?: ComponentType<
    Pick<TCustomDialogProps<T>,
      'handleDialogContextSwitch'>
  >;
};

export type TKeyValueStringType = Record<string, string>;
export type TClassType = { className: string };
export type TKeyValueAnyType = Record<string, any>;

export type TProfileMenuItems = {
  shortcut?: string;
  state?: boolean;
  url?: string;
} & Required<Pick<TNavBarUrlType, 'Icon' | 'label'>> &
  TComponent;

export type TCustomDialogPropsContextProps<T = TKeyValueStringType> = {
  componentProps?: T;
} & TComponent<T> &
  Pick<TProfileMenuItems, 'state'>;

export type TCustomDialogProps<T = TKeyValueStringType> = {
  handleDialogContextSwitch: (
    context: TCustomDialogPropsContextProps<T>
  ) => void;
  children: ReactNode;
  toggleDialog: () => any;
  dialogOpen: boolean;
} & Partial<TClassType>;

export type TDebounceprops<TDebounceCallBackArgs> = {
  debounceCallback: (props: TDebounceCallBackArgs) => any;
  debounceTimeOut?: number;
};

export type DropdownActionItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  className?: string;
};

export type ReusableDropdownProps = {
  trigger: React.ReactNode;
  items: DropdownActionItem[];
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

export interface QuotePreviewProps {
  componentProps: any
  handleDialogContextSwitch: (
    data?: any
  ) => void;
}
export type RadioChoiceItem = {
  value: string
  label?: string
  description?: string
  icon?: LucideIcon
  iconSize?: number
  image?: string
  component?: ComponentType
  disabled?: boolean
}

export type RadioChoiceGroupProps = {
  items: RadioChoiceItem[]

  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void

  variant?: "radio" | "tabs"
  layout?: "horizontal" | "vertical"
  contentPosition?: "inline" | "stacked"

  activeColor?: string
  showSelector?: boolean
  selectorPosition?: "left" | "right"

  className?: string
}