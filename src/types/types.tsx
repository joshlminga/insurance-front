/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import type { Control, FieldValues, Path } from "react-hook-form";
import { type AxiosRequestConfig, type Method } from 'axios'
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { SORT_ORDER } from "@/utils/enums";
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from "@tanstack/table-core";
import { BENEFIT_TYPE_CONFIG } from "@/utils/constatnts";

export type T = {
  [key: string]: any;
  ReactNode?: ReactNode;
}

export type TPageTitleProps = { title: string } & Partial<TClassType>;

export interface ReusableStepperProps {
  steps: {
    title: string
    content: React.FC<{ goToNextStep: () => void; goToPrevStep: () => void }>
  }[]
  defaultStep?: number
  className?: string
  value?: number
  onValueChange?: (value: number) => void
  disabled?: boolean,
}
export interface LoginResponse {
  message: string
  user: any
  access_token: string
  is_general: boolean
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
  requireGeneral?: boolean
}
export interface PageHeaderProps {
  title: string
  description?: string
  actions?: PageHeaderAction[]
  children?: React.ReactNode
}
export type Tuser = {
  name?: string
  email?: string
  avatar?: string
  is_general?: boolean,
  id?: number
}

export interface VerificationToken {
  verification_url?: string
  verification_token: string
  verification_token_type: string
  verification_token_name: string
}

export interface VerificationData {
  email?: VerificationToken
  phone?: VerificationToken
}

export interface Guest {
  guestId: number
  verification: VerificationData
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
  control?: Control<T, any, any>
  name: Path<T>
  label: string
  id?: string
  placeholder?: string
  type?: string
  step?: string | number
  thousandsSeparator?: boolean
  autoComplete?: string
  required?: boolean
  className?: string
  rows?: number
  disabled?: boolean,
  accept?: string
}

export interface AuthProviderState {
  user: Tuser | null
  token: string | null
  guest: Guest | null
  isGeneral: boolean | null
  isAuthenticated: boolean
  isLoading: boolean
  country: string
  lang: string
  alpha: string
  login: (user: Tuser, token: string, isGeneral: boolean) => void
  logout: () => void
  updateUser: (user: Partial<Tuser>) => void
  setGuest: (guest: Guest | null) => void
  setLocale: (country: string, lang: string, alpha: string) => void
}

export interface UseApiQueryOptions<TData = unknown> {
  url: string
  params?: Record<string, any>
  config?: AxiosRequestConfig
  queryOptions?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
  signal?: any,
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
  message: string,
  success: string,
  data: any,
  pagination?: {
    total: number,
    page: number,
    per_page: number,
    total_pages: number,
    last_page: number,
    current_page: number
  }
  CheckoutRequestID?: any
}
export interface CustomerVerificationDetailsProps {
  goToNextStep?: () => void
  goToPrevStep?: () => void
}

export interface premiumPreview {
  goToNextStep?: () => void
  goToPrevStep?: () => void
  componentProps?: any;
  handleDialogContextSwitch: any,
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

export type TRouteTab = {
  label: string
  path: string
}

export type TRouteTabNavProps = {
  tabs: TRouteTab[]
  basePath: string
  className?: string
}

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
  label?: string
  name?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export type ReusableCheckboxGridProps = {
  options: CheckboxOption[]
  columns?: number
  className?: string,
  name?: string
}

export type ReusablePaginationProps = {
  currentPage?: number
  totalPages?: number
  onPageChange: (page: number) => void
  siblingCount?: number
  disabled?: boolean
  className?: string
  page?: number
  pageCount?: number
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

  onChange?: (checked: boolean) => void
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

export type TTableReusableComponent<T = any> = {
  OtherTools?: React.ComponentType<Partial<TClassType> & TSearchToolProps>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  OtherToolsProps: Partial<TSearchToolProps>;
  setPageSize: (page: number) => void;

  onPageChange: (page: number) => void;
  rowSelection?: RowSelectionState;
  onClick?: (row: Row<T>) => void;
  columns: ColumnDef<any, any>[];
  showPagination?: boolean;
  title?: string | ReactNode;
  pageCount: number;
  isLoading?: boolean;
  pageSize: number;
  isError?: boolean;
  page?: number;
  data: T[];
};

export type TCommandOption<T = string> = { label: string; value?: T };

export type TSearchToolProps = {
  onChange: (value: string) => void;
  advancedHandler?: () => any;
  includeFilter?: boolean;
  placeholder?: string;
  title?: string;
} & Partial<TClassType> &
  Pick<TNavBarUrlType, 'Icon'>;

export type TQueryFieldProps = {} & Partial<TClassType> & TSearchToolProps;

export interface StatusPillProps {
  status: string;
  label: string;
}

export type SingleActionsHandler<T = string> = {
  conditional?: (payload: T) => boolean;
  condition?: any;
} & TCommandOption<T> &
  Pick<TDropDownProps<T>, 'onSelect'>;

export type TDropDownProps<T = string> = {
  commandOptions: TCommandOption[];
  onSelect: (val: T) => void;
  selectedOption?: string;
  includeSearch?: boolean;
  triggerEl: ReactNode;
} & Partial<TClassType>;

export type TActionColumnGenProps<T = string> = {
  ActionsHandlerMapping: SingleActionsHandler<T>[];
};

export type TReusableDropdownProp<T> = {
  className?: string;
} & Pick<TDropDownProps<T>, "triggerEl"> &
  TActionColumnGenProps<T>;

export interface TCountry {
  id?: number
  name?: string,
  meta?: any,
  alpha2?: string;
  alpha3?: string;
  countryCallingCodes?: string[];
  currencies?: string[];
  emoji?: string;
  ioc?: string;
  languages?: string[];
  status?: string;
}

export interface TCountryResponse {
  data: TCountry[]
  pagination: any
}
export interface TCountriesInputMultiselectProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

export type ReuseableSingleSelectCountriesInputProps<T extends FieldValues> = {
  value?: string
  name?: Path<T>
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export type UserMenuItem = {
  label: string
  to?: string
  icon?: LucideIcon
  onClick?: () => void
  destructive?: boolean
}

export type UserMenuPopoverProps = {
  userInitials: string
  userName: string
  userEmail?: string
  items: UserMenuItem[]
  className?: string
}

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export interface CoverData {
  id: string
  title: string
  variation?: string | null
  status: string
  date: string
  img: string
}

export interface CoverCardProps {
  cover: CoverData
}

export type ReusableSingleSelectApiInputProps = {
  url: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  queryParams?: Record<string, any>;
  labelKey?: string;
  valueKey?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export type ReusableApiMultiSelectProps = {
  url: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  queryParams?: Record<string, any>;
  labelKey?: string;
  valueKey?: string;
  searchKeys?: string[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export type VehicleClassItem = {
  id: number
  name: string
  slug: string
  is_active: boolean
}

export type MpesaPayload = {
  phone: string
  amount: number
  invoice_id: string
  transaction_desc?: string
}

export type MpesaPollResponse = {
  status?: string
  message?: string
  ResultCode?: number
  ResultDesc?: string
  data?: {
    status?: string
    message?: string
    ResultCode?: number
    ResultDesc?: string
    CheckoutRequestID?: string
    checkout_request_id?: string
  }
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export type ClaimItem = {
  id: string
  coverTitle: string
  policyNumber: string
  incidentDate: string
  submittedDate: string
  amount: number
  status: ClaimStatus
}

export type BenefitType = keyof typeof BENEFIT_TYPE_CONFIG;
export type StepState = "completed" | "active" | "upcoming"

export type AuthState = {
  user: Tuser | null
  token: string | null
  guest: Guest | null
  isGeneral: boolean | null
  hasHydrated: boolean
  country: string
  lang: string
  alpha: string
  login: (user: Tuser, token: string, isGeneral: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<Tuser>) => void
  setGuest: (guest: Guest | null) => void
  setLocale: (country: string, lang: string, alpha: string) => void
}

export type MotorBenefitOption = {
  id: number
  group?: string | null
  type?: string | null
  name?: string | null
  label?: string | null
  reference?: string | null
}

export type BenefitGroup = {
  group: string
  items: MotorBenefitOption[]
}

export type TLoaderProps = Partial<TClassType> &
  Partial<Pick<TPageTitleProps, "title">> & {
    isError?: boolean
    children?: ReactNode
  };

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonClassName?: string
  cancelButtonClassName?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isPending?: boolean
  icon?: ReactNode
}

export type ListedBenefitStatus = 'compulsory' | 'inclusive' | 'selected' | 'na' | 'no'

export type ListedBenefitResolved = {
    text: string
    status: ListedBenefitStatus
}

export type TMessages = {
    id: number;
    text: string;
    sender: 'user' | 'agent';
    createdAt: string;
};