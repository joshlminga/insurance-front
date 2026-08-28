/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import type {
    ButtonProps,
    RadioChoiceGroupProps,
    ReusableCardProps,
    ReusableCheckboxGridProps,
    ReusableDropdownProps,
    ReusablePaginationProps,
    ReusableStepperProps,
    ReuseableSingleSelectCountriesInputProps,
    RHFInputProps,
    TCountriesInputMultiselectProps,
    TCustomDialogProps,
    TKeyValueStringType,
    TNodeChildrentType,
    TReusableDropdownProp,
    TReusablePageProps,
    TRHFSelectProps,
    TTableReusableComponent,
    TTabsProps,
    TRouteTabNavProps,
    TCountryResponse,
    SubmitResponse,
    UserMenuPopoverProps,
    ReusableSingleSelectApiInputProps,
    ReusableApiMultiSelectProps,
    TFilterOptions,
    TPaginationFilters,
    TLoaderProps,
    ProfileMenuItemProps,
    ConfirmationDialogProps,
    ReusableSwitchToggleProps,
    ReusablePopoverProps,
    SearchableCommandSelectProps,
    ReusableTabComponentProps
} from "@/types/types";
import {
    Stepper,
    StepperContent,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperTitle,
    StepperTrigger,
} from '@/components/ui/stepper';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2, OctagonAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Controller, type FieldValues } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue
} from "@/components/ui/multi-select";
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    CONFIRMATION_DIALOG_CANCEL_CLASSES,
    CONFIRMATION_DIALOG_CONFIRM_CLASSES,
    EMETHODS,
    EORGANIZATIONTYPES,
    FILTEROPTIONS,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    ADMIN_MOTOR_CUSTOMER_EMAIL_KEY,
    ReusableReducer
} from "@/utils/constatnts";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ShowToast } from "@/utils/utils";
import { extractErrorMessage } from "@/utils/helpers";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChatIndexPage } from "@/app/chat-components/page";
import { Switch } from "@/components/ui/switch";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { useTabs } from "@/hooks";

const formatSegment = (segment: string) => {
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BreadCrumbComponent = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isDashboardArea = pathSegments[0] === EPREFIX.DASHBOARD;
    const segments = isDashboardArea ? pathSegments.slice(1) : pathSegments;
    const basePath = isDashboardArea ? EPREFIX.DASHBOARD : "";

    return (
        <div className="min-w-0 w-auto overflow-hidden">
            <Breadcrumb>
                <BreadcrumbList className="flex-nowrap">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={EROUTES.DASHBOARD}>Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {segments.map((segment, index) => {
                        const href = `${basePath}/${segments.slice(0, index + 1).join("/")}`;
                        const isLast = index === segments.length - 1;
                        const title = formatSegment(segment);

                        return (
                            <Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem className="max-w-32 truncate sm:max-w-48">
                                    {isLast ? (
                                        <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to={href} className="truncate">{title}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export const ReusablePageTitle = ({
    children = null,
    description,
    title,
}: TReusablePageProps) => {
    return (
        <>
            <title>{`${title} - Accensure Insurance Marketplace`}</title>
            {description && <meta name="description" content={description} />}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-primary font-semibold text-xl leading-8">
                            {title}
                        </p>
                        <p className="font-normal text-base leading-7">
                            {description}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <BreadCrumbComponent />
                    </div>
                </div>
                {children && <div className="w-fit self-end">{children}</div>}
            </div>
        </>
    );
};

export function ReusableStepper({
    steps,
    defaultStep = 1,
    className,
    value,
    onValueChange,
}: ReusableStepperProps) {
    const [internalStep, setInternalStep] = useState(defaultStep)
    const isControlled = value !== undefined
    const currentStep = isControlled ? value : internalStep
    const handleStepChange = (step: number) => {
        if (isControlled) {
            onValueChange?.(step)
        } else {
            setInternalStep(step)
        }
    }
    const goToStep = (step: number) => handleStepChange(step)
    console.log(value);

    return (
        <Stepper value={currentStep} onValueChange={handleStepChange} className={className}>
            <StepperNav className="flex items-start gap-1 sm:gap-1 mb-2 sm:mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    return (
                        <StepperItem
                            key={stepNumber}
                            step={stepNumber}
                            className="relative flex-1 min-w-15 sm:min-w-0 items-start">
                            <StepperTrigger className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 grow">
                                {/* <StepperIndicator
                                    className={cn("hidden sm:block h-2 sm:h-4.25 w-full max-w-20 sm:max-w-31 rounded-[20px] transition-all",
                                        "bg-gray-300 data-[state=active]:bg-linear-to-r from-[#FFB3B3] via-[#FF8383] to-[#FF4545]")} /> */}

                                <StepperTitle className="hidden sm:block text-start text-xs lg:text-sm font-semibold group-data-[state=inactive]/step:text-muted-foreground truncate max-w-25 lg:max-w-none">
                                    {step.title}
                                </StepperTitle>
                            </StepperTrigger>
                        </StepperItem>
                    )
                })}
            </StepperNav>
            <StepperPanel className="text-sm">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const StepComponent = step.content
                    return (
                        <StepperContent
                            key={stepNumber}
                            value={stepNumber}
                            className="w-full">
                            <StepComponent
                                goToNextStep={() => goToStep(currentStep + 1)}
                                goToPrevStep={() => goToStep(currentStep - 1)}
                            />
                        </StepperContent>
                    )
                })}
            </StepperPanel>
        </Stepper>
    )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, loading, leftIcon, rightIcon, fullWidth, className, ...props }, ref) => {
        return (
            <ShadButton
                ref={ref}
                disabled={props.disabled || loading}
                className={cn(fullWidth && "w-full", className)}
                aria-busy={loading}
                {...props} >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                <span>{children}</span>
                {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </ShadButton>
        )
    }
)

export function ReuseableInput<T extends FieldValues>({
    control,
    name,
    label,
    id,
    placeholder,
    type = "text",
    step,
    thousandsSeparator = false,
    autoComplete = "off",
    required = false,
    disabled = false,
    className,
    rows,
    accept,
    min,
    max,
}: RHFInputProps<T>) {
    const toRawNumberString = (value: string) => {
        const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "")
        const [intPart, ...rest] = cleaned.split(".")
        if (rest.length === 0) return intPart
        return `${intPart}.${rest.join("")}`
    }

    const formatThousands = (raw: string) => {
        if (!raw) return ""
        const [intPart, decPart] = raw.split(".")
        const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return decPart !== undefined && decPart.length > 0 ? `${withCommas}.${decPart}` : withCommas
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const isFile = type === "file"
                const shouldFormatThousands = !isFile && thousandsSeparator

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}  {required && <span className="ml-1 text-red-500">*</span>}</FieldLabel>
                        <Input
                            {...(!isFile ? field : {})}
                            id={id}
                            type={shouldFormatThousands ? "text" : type}
                            step={step}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            aria-invalid={fieldState.invalid}
                            required={required}
                            disabled={disabled}
                            accept={accept}
                            min={min}
                            max={max}
                            className={cn(
                                className,
                                fieldState.invalid &&
                                "border-red-500 focus-visible:ring-red-500"
                            )}
                            {...(!isFile
                                ? {
                                    value: shouldFormatThousands
                                        ? formatThousands(String(field.value ?? ""))
                                        : (field.value ?? ""),
                                }
                                : {})}
                            onChange={(e) => {
                                if (isFile) {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    field.onChange(file)
                                } else {
                                    if (shouldFormatThousands) {
                                        const nextRaw = toRawNumberString((e.target as HTMLInputElement).value)
                                        field.onChange(nextRaw)
                                    } else {
                                        field.onChange(e)
                                    }
                                }
                            }}
                            {...(type === "textarea" && { rows })}
                        />
                        {fieldState.invalid && fieldState.error && (
                            <FieldError className="text-red-500 text-sm mt-1">
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )
            }}
        />
    )
}

export function ReusableSelect<T extends FieldValues>({
    control,
    name,
    label,
    placeholder = "Select an option",
    options,
    required = false,
    disabled = false,
    className,
    triggerClassName,
}: TRHFSelectProps<T>) {
    return (
        <div>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <Field
                        data-invalid={fieldState.invalid}
                        className={cn("w-full", className)}>
                        {label && (
                            <FieldLabel>
                                {label}
                                {required && <span className="ml-1 text-red-500">*</span>}
                            </FieldLabel>
                        )}
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={disabled}>
                            <SelectTrigger
                                aria-invalid={fieldState.invalid}
                                className={cn(
                                    "w-full h-10 rounded-[5px] border border-[#ADABAB]",
                                    fieldState.invalid &&
                                    "border-red-500 focus:ring-red-500",
                                    triggerClassName
                                )}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent className="">
                                {options.map(option => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disabled}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldState.error && (
                            <FieldError className="mt-1 text-sm text-red-500">
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )}
            />
        </div>
    )
}

export const ReusableCheckboxGrid = ({
    options,
    name,
    columns = 3,
    className = '',
}: ReusableCheckboxGridProps) => {
    return (
        <div
            className={`grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} ${className}`}>
            {options.map((option) => (
                <div key={option.id} className="flex items-start gap-2 mt-2">
                    <Checkbox
                        id={`checkbox-${option.id}`}
                        checked={option.checked}
                        disabled={option.disabled}
                        name={name}
                        onCheckedChange={(checked) => {
                            if (option.disabled) return
                            option.onChange?.(Boolean(checked));
                        }}
                        className="w-3.75 h-3.75 rounded-[3px] border border-[#D9D9D9]
                       data-[state=checked]:bg-[#C20C0C]
                       data-[state=checked]:border-[#C20C0C]"
                    />
                    <label
                        htmlFor={`checkbox-${option.id}`}
                        className="cursor-pointer max-w-112.25 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {option?.name}
                    </label>
                </div>
            ))}
        </div>
    )
}
export function ReusableTabs({
    tabs,
    defaultValue,
    value,
    onValueChange,
    className,
    tabsListClassName,
    triggerClassName,
    contentClassName,
    ...props
}: TTabsProps) {

    return (
        <Tabs
            defaultValue={defaultValue ?? tabs[0]?.value}
            value={value}
            onValueChange={onValueChange}
            className={cn("w-full", className)}>
            <TabsList className={cn("h-auto min-h-10 sm:min-h-10 lg:h-10 w-full max-w-full lg:max-w-130 rounded-[12px] sm:rounded-[20px] border border-[#ADABAB] bg-white p-0 flex flex-wrap sm:flex-nowrap",
                tabsListClassName
            )}>
                {tabs.map((tab) => {
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            disabled={tab.disabled}
                            className={cn(
                                "flex-1 h-6 sm:h-full min-w-0 rounded-none",
                                "first:rounded-tl-[12px] first:rounded-bl-[12px] sm:first:rounded-l-[20px]",
                                "last:rounded-tr-[12px] last:rounded-br-[12px] sm:last:rounded-r-[20px]",
                                "data-[state=active]:bg-[#C20C0C] data-[state=active]:text-white",
                                "data-[state=inactive]:bg-white data-[state=inactive]:text-black",
                                "flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-lg font-medium px-2 sm:px-4",
                                triggerClassName
                            )}>
                            <span className="">{tab.label}</span>
                        </TabsTrigger>
                    )
                })}
            </TabsList>
            {tabs.map((tab) => {
                const TabComponent = tab.component

                return (
                    <TabsContent
                        key={tab.value}
                        value={tab.value}
                        className={cn("mt-6 w-full", contentClassName)}>
                        <TabComponent {...props} />
                    </TabsContent>
                )
            })}
        </Tabs>
    )
}

export function RouteTabNav({ tabs, basePath, className }: TRouteTabNavProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const isActive = (tabPath: string) => {
        return tabPath
            ? location.pathname.includes(tabPath)
            : location.pathname === basePath || location.pathname === `${basePath}/`
    }
    return (
        <div className={cn("flex border-b", className)}>
            {tabs.map((tab) => {
                const fullPath = tab.path ? `${basePath}/${tab.path}` : basePath
                const active = isActive(tab.path)
                return (
                    <button
                        key={tab.label}
                        onClick={() => navigate(fullPath)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            active
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}>
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

export const ReusablePagination = ({
    currentPage: currentPageProp,
    totalPages: totalPagesProp,
    onPageChange,
    siblingCount = 1,
    disabled = false,
    className,
    page: pageProp,
    pageCount: pageCountProp,
}: ReusablePaginationProps) => {
    const currentPage = pageProp ?? currentPageProp ?? 1
    const totalPages = pageCountProp ?? totalPagesProp ?? 1

    if (totalPages < 1) return null
    const range = (start: number, end: number) =>
        Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)
    const showLeftEllipsis = leftSibling > 2
    const showRightEllipsis = rightSibling < totalPages - 1

    const pages: (number | "ellipsis")[] = []
    pages.push(1)
    if (showLeftEllipsis) pages.push("ellipsis")
    pages.push(...range(leftSibling, rightSibling).filter(p => p !== 1 && p !== totalPages))
    if (showRightEllipsis) pages.push("ellipsis")
    if (totalPages > 1) pages.push(totalPages)

    const goToPage = (page: number) => {
        if (disabled || page < 1 || page > totalPages || page === currentPage) return
        onPageChange(page)
    }

    const isPrevDisabled = disabled || currentPage <= 1
    const isNextDisabled = disabled || currentPage >= totalPages

    return (
        <Pagination className={cn(className)}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage - 1)
                        }}
                        aria-disabled={isPrevDisabled}
                        className={cn(isPrevDisabled && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>

                {pages.map((page, index) => (
                    <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
                        {page === "ellipsis" ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                    e.preventDefault()
                                    goToPage(page)
                                }}
                                className={cn(disabled && "pointer-events-none opacity-50")}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage + 1)
                        }}
                        aria-disabled={isNextDisabled}
                        className={cn(isNextDisabled && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export const ReusableCard = ({
    header,
    children,
    footer,
    rootClassName,
    headerClassName,
    contentClassName,
    footerClassName,
    onClick,
    disabled,
    selected,
    onChange,
}: ReusableCardProps) => {
    const isClickable = Boolean(onClick) && !disabled;
    const showCheckbox = Boolean(onChange);
    return (
        <Card
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : -1}
            aria-disabled={disabled}
            onClick={disabled ? undefined : onClick}
            onKeyDown={(e) => {
                if (!isClickable) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className={cn("relative flex flex-col w-full min-w-0 overflow-hidden rounded-[10px] border bg-white",
                selected ? "border-[#C20C0C] border-2" : "border-[#ADABAB]",
                isClickable &&
                "cursor-pointer transition-all hover:border-[#FF9A9A] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-[#FF9A9A]",
                disabled && "opacity-50 cursor-not-allowed",
                rootClassName
            )}>
            {showCheckbox && (
                <Input
                    type="checkbox"
                    className="absolute top-3 right-3 z-10 h-4 w-4 cursor-pointer accent-[#C20C0C] rounded"
                    checked={!!selected}
                    disabled={disabled}
                    onChange={(e) => {
                        e.stopPropagation();
                        if (disabled) return;
                        onChange?.(e.target.checked);
                    }}
                />
            )}
            {header && (
                <CardHeader className={cn('flex items-center justify-center p-3 text-center', headerClassName)}>
                    {header.type === 'image' && (
                        <div className="flex h-14 w-full max-w-27 items-center justify-center sm:h-15">
                            <img
                                src={header.src}
                                alt={header.alt ?? ''}
                                className={cn(
                                    'max-w-full max-h-full object-contain',
                                    header.className
                                )}
                            />
                        </div>
                    )}
                    {header.type === 'text' && (
                        <div className={cn('flex flex-col gap-1', header.className)}>
                            <h3 className="text-sm font-semibold">
                                {header.title}
                            </h3>
                            {header.description && (
                                <p className="text-xs text-muted-foreground">
                                    {header.description}
                                </p>
                            )}
                        </div>
                    )}
                    {header.type === 'custom' && header.node}
                </CardHeader>
            )}
            <CardContent className={cn('flex flex-col gap-2 px-4 py-2', contentClassName)}>
                {children}
            </CardContent>
            {footer && (
                <CardFooter className={cn(footerClassName, 'mt-auto px-4 pb-3')}>
                    {footer}
                </CardFooter>
            )}
        </Card>
    )
}

export const CustomDialogComponent = <T = TKeyValueStringType,>({
    handleDialogContextSwitch,
    dialogOpen,
    className,
    children,
    title,
}: Pick<
    TCustomDialogProps<T>,
    "children" | "dialogOpen" | "handleDialogContextSwitch" | "className" | "title"
>) => {
    return (
        <Dialog
            {...{
                onOpenChange: () => handleDialogContextSwitch({}),
                open: dialogOpen,
                modal: true,
            }}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(
                    "select-none max-h-[80dvh] flex flex-col overflow-hidden p-0! m-0!",
                    className ?? ""
                )}>
                {title ? (
                    <DialogTitle className="sr-only">{title}</DialogTitle>
                ) : null}
                <div
                    {...{
                        className: `relative w-full flex-1 h-full overflow-y-auto py-5! px-5`,
                    }}>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ReusableDropdown = ({
    trigger,
    items,
    side = "right",
    align = "center",
    contentClassName,
}: ReusableDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side={side}
                align={align}
                className={cn("min-w-45 p-1", contentClassName)}>
                {items.map((item, index) =>
                    item.separator ? (
                        <DropdownMenuSeparator key={index} />
                    ) : (
                        <DropdownMenuItem
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                item.className
                            )}>
                            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const ReuseableRadioChoiceGroup: React.FC<RadioChoiceGroupProps> = ({
    items,
    value,
    defaultValue,
    onValueChange,
    variant = "radio",
    layout = "vertical",
    contentPosition = "inline",
    activeColor = "#3771C8",
    showSelector = true,
    selectorPosition = "right",
    imagePriority = false,
    borderOnlyActive = false,
    neutralSelector = false,
    className,
}) => {
    const [internalValue, setInternalValue] =
        React.useState(defaultValue)
    const selected = value ?? internalValue
    const handleChange = (val: string) => {
        if (!value) setInternalValue(val)
        onValueChange?.(val)
    }
    return (
        <>
            <RadioGroup
                value={selected}
                defaultValue={defaultValue}
                onValueChange={handleChange}
                className={cn(
                    layout === "horizontal"
                        ? imagePriority
                            ? "grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
                            : "flex gap-6"
                        : "flex flex-col gap-3",
                    className
                )}>
                {items.map((item) => {
                    const isActive = selected === item.value
                    const Icon = item.icon
                    return (
                        <label
                            key={item.value}
                            className={cn(
                                "cursor-pointer rounded-lg border transition-all",
                                imagePriority
                                    ? "relative flex w-full items-center justify-center overflow-hidden border-black/20 bg-white p-1 shadow-sm"
                                    : cn(
                                        "p-4",
                                        contentPosition === "inline"
                                            ? "flex items-center justify-between gap-4"
                                            : "flex flex-col gap-3",
                                    ),
                                borderOnlyActive && isActive && "shadow-md",
                                (borderOnlyActive || imagePriority) && "bg-white",
                                !imagePriority && !borderOnlyActive && "transition-all",
                                item.disabled &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                                borderColor: isActive ? activeColor : undefined,
                                ...(!borderOnlyActive && isActive && !imagePriority
                                    ? { backgroundColor: `${activeColor}10` }
                                    : {}),
                            }}>
                            {showSelector && selectorPosition === "left" && (
                                <RadioGroupItem
                                    value={item.value}
                                    disabled={item.disabled}
                                    className={cn(
                                        imagePriority
                                            ? "absolute top-1 left-1 z-10 mr-0 size-3.5"
                                            : "mr-3",
                                    )}
                                    style={
                                        neutralSelector
                                            ? undefined
                                            : {
                                                borderColor: isActive
                                                    ? activeColor
                                                    : undefined,
                                            }
                                    }
                                />
                            )}
                            <div
                                className={cn(
                                    "flex items-center flex-1",
                                    imagePriority ? "h-full w-full justify-center" : "gap-3",
                                )}>
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.label ?? item.value}
                                        className={cn(
                                            imagePriority
                                                ? "w-20 h-auto object-contain"
                                                : "h-8 w-20 object-contain",
                                        )}
                                    />
                                )}

                                {Icon && (
                                    <Icon
                                        size={item.iconSize ?? 18}
                                        color={
                                            isActive && !neutralSelector
                                                ? activeColor
                                                : undefined
                                        }
                                    />)}
                                {!imagePriority && (
                                    <div>
                                        <div
                                            className="font-semibold"
                                            style={{
                                                color: isActive
                                                    ? activeColor
                                                    : undefined,
                                            }}>
                                            {item.label}
                                        </div>
                                        {item.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {showSelector &&
                                selectorPosition === "right" && (
                                    <RadioGroupItem
                                        value={item.value}
                                        disabled={item.disabled}
                                        style={
                                            neutralSelector
                                                ? undefined
                                                : {
                                                    borderColor: isActive
                                                        ? activeColor
                                                        : undefined,
                                                }
                                        }
                                    />
                                )}
                        </label>
                    )
                })}
            </RadioGroup>
            {variant === "tabs" && (
                <div className="mt-6">
                    {(() => {
                        const SelectedComponent = items.find(
                            (i) => i.value === selected
                        )?.component

                        return SelectedComponent ? (
                            <SelectedComponent />
                        ) : null
                    })()}
                </div>
            )}
        </>
    )
}

export const TableComponentHeadings = ({ children }: TNodeChildrentType) => {
    return (
        <div className='flex flex-col justify-between items-center w-full gap-6 flex-wrap px-6 py-2.5'>
            {children}
        </div>
    );
};

export const PageForPagination = ({
    active = false,
    content,
    handler,
}: {
    handler: (data: any) => void;
    content: string;
    active?: boolean;
}) => (
    <div className={`rounded-xl selection:bg-inherit flex items-center justify-center leading-6 hover:bg-[#F9F5FF] text-[14px] 
    font-medium text-center cursor-pointer w-10 h-10 ${active ? 'bg-[#F9F5FF] text-[#D11F3E]' : 'text-main-orange'
        }`}
        onClick={handler}>
        {content}
    </div>
);

export const TReusablePagination = ({
    onPageChange,
    pageCount,
    page,
}: Pick<TTableReusableComponent, 'onPageChange' | 'pageCount'> &
    Required<Pick<TTableReusableComponent, 'page'>>) => {
    return (
        <div className='flex flex-col items-center'>
            <div className='flex items-center justify-center'>
                {pageCount > 6 ? (
                    <>
                        {new Array(3).fill(0).map((_, index) => (
                            <PageForPagination
                                {...{
                                    handler: () => onPageChange(1 + index),
                                    active: page === index + 1,
                                    content: `${1 + index}`,
                                }}
                                key={index}
                            />
                        ))}

                        <PageForPagination
                            {...{
                                handler: () => { },
                                active: false,
                                content: '...',
                            }}
                        />

                        {new Array(3).fill(0).map((_, index) => (
                            <PageForPagination
                                {...{
                                    handler: () => onPageChange(pageCount - (3 - index)),
                                    active: page === pageCount + (3 - index),
                                    content: `${3 - index}`,
                                }}
                                key={index}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {new Array(pageCount).fill(0).map((_, index) => (
                            <PageForPagination
                                {...{
                                    content: `${index + 1}`,
                                    handler: () => onPageChange(index + 1),
                                    active: page === index + 1,
                                }}
                                key={index}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export const ReusableDropDownComponent = <T,>({
    className = "w-fit max-w-20",
    ActionsHandlerMapping,
    triggerEl,
}: TReusableDropdownProp<T>) => {
    return (
        <DropdownMenu
            {...{
                modal: true,
            }}>
            <DropdownMenuTrigger asChild>{triggerEl}</DropdownMenuTrigger>
            <DropdownMenuContent className={cn(className)}>
                {ActionsHandlerMapping.map(({ label, value, onSelect }, index) => {
                    return (
                        <DropdownMenuItem
                            className='w-full capitalize'
                            {...{
                                onSelect: () => value && onSelect(value),
                                align: 'end',
                            }}
                            key={index}>
                            {label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Read nested fields like "user.name" (same idea as PHP $item['user']['name']).
// Plain keys like "name" still work because there is no dot to split.
function getByPath(item: any, path: string) {
    return path.split(".").reduce((acc, key) => acc?.[key], item);
}

const SearchableCommandSelect = ({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    disabled = false,
    isLoading = false,
    isFetching = false,
    onSearchChange,
    footer,
}: SearchableCommandSelectProps) => {
    const [open, setOpen] = useState(false)
    const selectedOption = options.find((option) => option.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <ShadButton
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full h-10 justify-between rounded-[5px] border-[#ADABAB] font-normal hover:bg-transparent">
                    <span className="truncate">
                        {selectedOption?.label ?? (isLoading ? "Loading..." : placeholder)}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </ShadButton>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command shouldFilter={!onSearchChange}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={onSearchChange}
                    />
                    <CommandList>
                        {!isLoading && !isFetching && <CommandEmpty>{emptyMessage}</CommandEmpty>}
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.searchValue ?? String(option.label)}
                                    onSelect={() => {
                                        onChange?.(option.value)
                                        setOpen(false)
                                    }}>
                                    <Check className={cn("size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {(isLoading || isFetching) && (
                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                <Loader2 className="size-3 animate-spin" />
                                Loading...
                            </div>
                        )}
                        {footer}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export const ReusableCountriesInputMultiselect = ({
    value,
    onChange,
    placeholder = 'Select countries...',
    label,
    required = false,
}: TCountriesInputMultiselectProps) => {
    const { data, isLoading } = UseApiQuery<TCountryResponse>({
        url: 'taxonomies/general/countries',
        params: { direction: 'asc' },
        queryOptions: { enabled: true },
    })
    const countries = data?.data ?? []
    return (
        <div className="space-y-2 w-full">
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </Label>
            )}
            <MultiSelect
                values={value ?? []}
                onValuesChange={(vals) => onChange?.(vals)} >
                <MultiSelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <MultiSelectValue placeholder={placeholder} />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectGroup>
                        {!isLoading && countries.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No countries found.
                            </div>
                        )}
                        {countries.map((country) => (
                            <MultiSelectItem
                                key={country.id}
                                value={String(country.id)}
                            >
                                {country.name}
                            </MultiSelectItem>
                        ))}
                    </MultiSelectGroup>
                </MultiSelectContent>
            </MultiSelect>
        </div>
    )
}

export function ReuseableSingleSelectCountriesInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select country...",
    label,
    required = false,
    disabled = false,
    className,
}: ReuseableSingleSelectCountriesInputProps<T>) {

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 300 }
    )
    const observerRef = useRef<HTMLDivElement | null>(null)
    const { data, isLoading } = UseApiQuery<TCountryResponse>({
        url: "taxonomies/general/countries",
        params: {
            direction: "asc",
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            placeholderData: (previousData) => previousData,
        },
    });
    const countries = data?.data ?? []
    const meta = data?.pagination;
    useEffect(() => {
        if (!observerRef.current) return
        const observer = new IntersectionObserver((entries) => {
            if (
                entries[0].isIntersecting &&
                !isLoading &&
                meta &&
                filter.page < meta.last_page
            ) {
                optionsDispatcher({
                    type: "SET_PAGE",
                    payload: { page: filter.page + 1 },
                })
            }
        })
        observer.observe(observerRef.current)

        return () => observer.disconnect()
    }, [meta, filter.page, isLoading])

    const handleSearch = (value: string) => {
        optionsDispatcher({
            type: "SET_FILTER",
            payload: { term: value, page: 1 },
        })
    }

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}

            <SearchableCommandSelect
                value={value}
                onChange={onChange}
                options={countries.map((country) => ({ value: String(country.id), label: country.name ?? "" }))}
                placeholder={placeholder}
                searchPlaceholder="Search country..."
                emptyMessage="No countries found"
                disabled={disabled}
                isLoading={isLoading}
                onSearchChange={handleSearch}
                footer={<div ref={observerRef} className="h-4" />}
            />
        </div>
    )
}


export function ReuseableSingleSelectNationalityInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select nationality...",
    label,
    required = false,
    disabled = false,
    className,
}: ReuseableSingleSelectCountriesInputProps<T>) {

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    )
    const observerRef = useRef<HTMLDivElement | null>(null)
    const { data, isLoading } = UseApiQuery<TCountryResponse>({
        url: "taxonomies/geo/nationality",
        params: {
            direction: "asc",
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            placeholderData: (previousData) => previousData,
        },
    });
    const countries = data?.data ?? []
    const meta = data?.pagination;
    useEffect(() => {
        if (!observerRef.current) return
        const observer = new IntersectionObserver((entries) => {
            if (
                entries[0].isIntersecting &&
                !isLoading &&
                meta &&
                filter.page < meta.last_page
            ) {
                optionsDispatcher({
                    type: "SET_PAGE",
                    payload: { page: filter.page + 1 },
                })
            }
        })
        observer.observe(observerRef.current)

        return () => observer.disconnect()
    }, [meta, filter.page, isLoading])

    const handleSearch = (value: string) => {
        optionsDispatcher({
            type: "SET_FILTER",
            payload: { term: value, page: 1 },
        })
    }

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}

            <SearchableCommandSelect
                value={value}
                onChange={onChange}
                options={countries.map((country) => ({ value: String(country.id), label: country.name ?? "" }))}
                placeholder={placeholder}
                searchPlaceholder="Search nationality..."
                emptyMessage="No nationalities found"
                disabled={disabled}
                isLoading={isLoading}
                onSearchChange={handleSearch}
                footer={<div ref={observerRef} className="h-4" />}
            />
        </div>
    )
}

export function ReuseableSingleSelectAdminInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select users...",
    label,
    required = false,
    disabled = false,
    className,

}: ReuseableSingleSelectCountriesInputProps<T>) {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: "admin/user",
        params: { direction: "asc" },
        queryOptions: { enabled: true },
    })
    const users = data?.data ?? []

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || isLoading}>
                <SelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={isLoading ? "Loading users..." : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {users.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                            {user?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && users.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No users found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}

export function ReuseableSingleSelectOrganizationInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select organization...",
    label,
    required = false,
    disabled = false,
    className,
}: ReuseableSingleSelectCountriesInputProps<T>) {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: "organization",
        params: { direction: "asc" },
        queryOptions: { enabled: true },
    })

    const organizations = data?.data ?? []

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || isLoading}
            >
                <SelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={isLoading ? "Loading organizations..." : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {organizations.map((org: any) => (
                        <SelectItem
                            key={org?.organization_id ?? org?.id}
                            value={String(org?.organization_id ?? org?.id)}
                        >
                            {org?.organization_name ?? org?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && organizations.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No organizations found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}

export const ReuseableSelectInsurerInput = <T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select insurer...",
    label,
    required = false,
    disabled = false,
    className,

}: ReuseableSingleSelectCountriesInputProps<T>) => {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `organization-location?organization_type=${EORGANIZATIONTYPES.INSURER}`,
        params: { direction: "asc" },
        queryOptions: { enabled: true },
    })
    const insurers = data?.data ?? [];
    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || isLoading}>
                <SelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={isLoading ? "Loading users..." : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {insurers.map((insurer: any) => (
                        <SelectItem key={insurer?.organization_location_id} value={String(insurer?.organization_location_id)}>
                            {insurer?.organization_name} - {insurer?.country?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && insurers.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No insurers found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}

export const ReusableOrganizationsInputMultiselect = ({
    value,
    onChange,
    placeholder = 'Select organizations...',
    label,
    required = false,
}: TCountriesInputMultiselectProps) => {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `organization-location?exclude_organization_type=${EORGANIZATIONTYPES.INSURER}`,
        params: { direction: 'asc' },
        queryOptions: { enabled: true },
    })
    const organizations = data?.data ?? [];
    return (
        <div className="space-y-2 w-full">
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </Label>
            )}
            <MultiSelect
                values={value ?? []}
                onValuesChange={(vals) => onChange?.(vals)} >
                <MultiSelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <MultiSelectValue placeholder={placeholder} />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectGroup>
                        {!isLoading && organizations.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No organizations found.
                            </div>
                        )}
                        {organizations.map((org: any) => (
                            <MultiSelectItem
                                key={org?.organization_location_id}
                                value={String(org?.organization_location_id)}>
                                {org?.organization_name} - {org?.country?.name}
                            </MultiSelectItem>
                        ))}
                    </MultiSelectGroup>
                </MultiSelectContent>
            </MultiSelect>
        </div>
    )
}

export function ReuseableSingleSelectclassInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select classes...",
    label,
    required = false,
    disabled = false,
    className,

}: ReuseableSingleSelectCountriesInputProps<T>) {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: "motor/vehicle-classes",
        params: { direction: "asc", is_active: true },
        queryOptions: { enabled: true },
    })
    const classes = data?.data ?? [];

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || isLoading}>
                <SelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={isLoading ? "Loading users..." : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {classes.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                            {user?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && classes.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No classes found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}

export function ReuseableSingleSelectVehicleUseInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select Vehicle uses...",
    label,
    required = false,
    disabled = false,
    className,
}: ReuseableSingleSelectCountriesInputProps<T>) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
        url: "motor/vehicle-use",
        params: {
            direction: "asc",
            is_active: true,
            term: debouncedSearch || undefined,
        },
        queryOptions: {
            enabled: true,
            staleTime: 1000 * 60 * 5,
        },
    });
    const vehicleUse = data?.data ?? [];
    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <SearchableCommandSelect
                value={value}
                onChange={onChange}
                options={vehicleUse.map((item: any) => ({ value: String(item.id), label: item?.name ?? "" }))}
                placeholder={placeholder}
                searchPlaceholder="Search vehicle use..."
                emptyMessage="No vehicle use found"
                disabled={disabled}
                isLoading={isLoading}
                isFetching={isFetching}
                onSearchChange={setSearch}
            />
        </div>
    );
}

export const ReusableCoveringInputMultiselect = ({
    value,
    onChange,
    placeholder = 'Select covering...',
    label,
    required = false,
}: TCountriesInputMultiselectProps) => {
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `motor/cover-covering`,
        params: { direction: 'asc', is_active: true },
        queryOptions: { enabled: true },
    })
    const covering = data?.data ?? [];
    return (
        <div className="space-y-2 w-full">
            {label && (
                <Label>
                    {label}
                    {required && (<span className="text-red-500 ml-1">*</span>)}
                </Label>
            )}
            <MultiSelect
                values={value ?? []}
                onValuesChange={(vals) => onChange?.(vals)} >
                <MultiSelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <MultiSelectValue placeholder={placeholder} />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectGroup>
                        {!isLoading && covering.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No covering found.
                            </div>
                        )}
                        {covering.map((covr: any) => (
                            <MultiSelectItem
                                key={covr?.id}
                                value={String(covr?.id)}>
                                {covr?.name}
                            </MultiSelectItem>
                        ))}
                    </MultiSelectGroup>
                </MultiSelectContent>
            </MultiSelect>
        </div>
    )
}

export function ReuseableSingleSelectCoveringInput<T extends FieldValues>({
    value,
    onChange,
    placeholder = "Select Covering...",
    label,
    required = false,
    disabled = false,
    className,
}: ReuseableSingleSelectCountriesInputProps<T>) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
        url: `motor/cover-covering`,
        params: {
            direction: "asc",
            is_active: true,
            term: debouncedSearch || undefined,
        },
        queryOptions: {
            enabled: true,
            staleTime: 1000 * 60 * 5,
        },
    });
    const covering = data?.data ?? [];
    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <SearchableCommandSelect
                value={value}
                onChange={onChange}
                options={covering.map((item: any) => ({ value: String(item.id), label: item?.name ?? "" }))}
                placeholder={placeholder}
                searchPlaceholder="Search covering..."
                emptyMessage="No covering found"
                disabled={disabled}
                isLoading={isLoading}
                isFetching={isFetching}
                onSearchChange={setSearch}
            />
        </div>
    );
}

export function ReusableSingleSelectApiInput({
    url,
    value,
    onChange,
    placeholder = "Select option...",
    label,
    required = false,
    disabled = false,
    className,
    queryParams = {},
    labelKey = "name",
    valueKey = "id",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found",
}: ReusableSingleSelectApiInputProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
        url,
        params: {
            direction: "asc",
            is_active: true,
            term: debouncedSearch || undefined,
            ...queryParams,
        },
        queryOptions: {
            enabled: !!url,
            staleTime: 1000 * 60 * 5,
        },
    });
    const items = data?.data ?? [];

    return (
        <div className={`space-y-2 ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <SearchableCommandSelect
                value={value}
                onChange={onChange}
                options={items.map((item: any) => ({
                    value: String(getByPath(item, valueKey) ?? ""),
                    label: String(getByPath(item, labelKey) ?? ""),
                }))}
                placeholder={placeholder}
                searchPlaceholder={searchPlaceholder}
                emptyMessage={emptyMessage}
                disabled={disabled}
                isLoading={isLoading}
                isFetching={isFetching}
                onSearchChange={setSearch}
            />
        </div>
    );
}

export function ReusableApiMultiSelect({
    url,
    value,
    onChange,
    placeholder = "Select options...",
    label,
    required = false,
    disabled = false,
    className,
    queryParams = {},
    labelKey = "name",
    valueKey = "id",
    searchKeys = ["name"],
    searchPlaceholder = "Search...",
    emptyMessage = "No results found",
    organizationLocationId
}: ReusableApiMultiSelectProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
        url,
        params: {
            organization_location_id: organizationLocationId,
            direction: "asc",
            term: debouncedSearch || undefined,
            ...queryParams,
        },
        queryOptions: {
            enabled: !!url,
            placeholderData: (previousData) => previousData,
            staleTime: 1000 * 60 * 5,
        },
    });
    const items = data?.data ?? [];
    const filteredItems = useMemo(() => {
        if (!search) return items;
        const lowerSearch = search.toLowerCase();
        return items.filter((item: any) =>
            searchKeys.some((key) =>
                String(item?.[key] ?? "")
                    .toLowerCase()
                    .includes(lowerSearch)
            )
        );
    }, [items, search, searchKeys]);
    const controlledValue = Array.isArray(value) ? value : [];

    return (
        <div className={`space-y-0 w-full ${className ?? ""}`}>
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <MultiSelect
                values={controlledValue}
                onValuesChange={(vals) => onChange?.(vals)}>
                <MultiSelectTrigger disabled={disabled} className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
                    <MultiSelectValue placeholder={placeholder} />
                </MultiSelectTrigger>
                <MultiSelectContent
                    search={{
                        placeholder: searchPlaceholder,
                        emptyMessage,
                        value: search,
                        onValueChange: setSearch,
                    }}>
                    {isFetching && (
                        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Searching...
                        </div>
                    )}
                    <MultiSelectGroup>
                        {!isLoading && filteredItems.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                {emptyMessage}
                            </div>
                        )}
                        {filteredItems.map((item: any) => (
                            <MultiSelectItem
                                key={String(getByPath(item, valueKey) ?? "")}
                                value={String(getByPath(item, valueKey) ?? "")}>
                                {getByPath(item, labelKey)}
                            </MultiSelectItem>
                        ))}
                    </MultiSelectGroup>
                </MultiSelectContent>
            </MultiSelect>
        </div>
    );
}

export const UserMenuPopover = ({
    userInitials,
    userName,
    userEmail,
    items,
    className,
}: UserMenuPopoverProps) => {
    return (
        <div className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className='h-11 w-11 rounded-full border border-white/70 bg-white/90 p-0 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white'>
                        {userInitials}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 rounded-xl p-2">
                    <div className="mb-2 rounded-lg bg-muted/40 px-3 py-2">
                        <p className="truncate text-sm font-semibold">{userName}</p>
                        {userEmail && (
                            <p className="truncate text-xs text-muted-foreground">
                                {userEmail}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        {items.map((item, index) => {
                            const baseClass = "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                            const Icon = item.icon
                            if (item.to) {
                                return (
                                    <Link key={index} to={item.to} className={baseClass}>
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {item.label}
                                    </Link>
                                )
                            }

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={item.onClick}
                                    className={`${baseClass} w-full text-left ${item.destructive ? "text-destructive" : ""}`}>
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export const SkeletonCard: React.FC = () => (
    <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden animate-pulse">
        <div className="flex items-center justify-center h-24 bg-gray-100">
            <div className="h-12 w-28 rounded bg-gray-200" />
        </div>
        <div className="px-4 py-3 space-y-3">
            <div className="flex justify-between">
                <div className="h-3.5 w-28 rounded bg-gray-200" />
                <div className="h-3.5 w-16 rounded bg-gray-200" />
            </div>
            <div className="flex justify-between">
                <div className="h-3.5 w-24 rounded bg-gray-200" />
                <div className="h-3.5 w-20 rounded bg-gray-200" />
            </div>
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
            <div className="h-9 flex-1 rounded-md bg-gray-200" />
            <div className="h-9 flex-1 rounded-md bg-gray-200" />
        </div>
    </div>
)

export const EmptyState: React.FC = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <OctagonAlert className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">No quotations available</p>
        <p className="mt-1 text-xs text-gray-400">
            Submit your vehicle details to generate premium quotes.
        </p>
    </div>
)

export const CustomLoader: React.FC<TLoaderProps> = ({
    title = "Fetching data...",
    className = "h-full",
    isError = false,
    children,
}) => (
    <div
        className={cn(
            "w-full flex justify-center items-center",
            className
        )}
    >
        {children ?? (
            isError ? (
                <p>{title}</p>
            ) : (
                <div role="status" className="flex flex-row items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C20C0C]" aria-hidden />
                    <p className="text-md font-semibold text-muted-foreground">{title}</p>
                </div>
            )
        )}
    </div>
);

export const SendDocumentsViaEmail = ({
    componentProps,
    handleDialogContextSwitch
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const requireRecipientEmail = componentProps?.requireRecipientEmail === true
    const [isSelf, setIsSelf] = useState(false)
    const quoteSessionId = (() => {
        const storedSessionId = Number(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY));

        if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
            return storedSessionId;
        }

        return null;
    })();
    const [email, setEmail] = useState<string>(() => {
        if (!requireRecipientEmail) return "";
        const prefilled =
            componentProps?.defaultEmail?.trim() ||
            sessionStorage.getItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY)?.trim() ||
            "";

        return prefilled;
    });

    const submitMutation = UseApiMutation<SubmitResponse, FormData>({
        url: `document/motor/send-quote-via-email/${quoteSessionId}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Sent successfully!")
                setEmail(requireRecipientEmail ? email : "")
                setIsSelf(false)
                componentProps?.refetch?.()
                handleDialogContextSwitch({ refetch: true })
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Sending failed!")
            },
        },
    })

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        const quoteType = componentProps?.data?.quote_type ?? "single"
        const isComparison = quoteType === "comparison"
        if (isComparison) {
            const products = componentProps?.data?.products
            if (!Array.isArray(products) || products.length < 2) {
                ShowToast.error("At least two quotations are required to share a comparison by email.")
                return
            }
        }
        const trimmedEmail = email.trim()
        if (requireRecipientEmail && !trimmedEmail) {
            ShowToast.error("Please enter the customer email address.")
            return
        }
        const productId = componentProps?.data?.product_id ?? componentProps?.data?.product?.id
        const rateId = componentProps?.data?.rate_id
        const sendToSelf = requireRecipientEmail ? false : isSelf
        const base: Record<string, unknown> = {
            is_self: sendToSelf,
            quote_type: quoteType,
        }
        if (!sendToSelf) {
            base.email = trimmedEmail
        }
        if (isComparison) {
            base.products = componentProps?.data?.products
        } else {
            base.product_id = productId ?? ""
            base.rate_id = rateId ?? ""
        }
        submitMutation.mutate(base as any)
    }

    return (
        <div className="w-full min-w-75 max-w-100 space-y-6 p-6">
            <div className="border-b pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        {requireRecipientEmail
                            ? "Send quote to customer email"
                            : "Share Via Email To Either Self or Another User"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {requireRecipientEmail
                            ? "Enter the customer email address. The quote will be sent to this address."
                            : "Enter the email address you want to share the documents with. You can also choose to send the documents to yourself."}
                    </p>
                </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                {!requireRecipientEmail && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_self"
                            checked={isSelf}
                            onCheckedChange={(checked) => setIsSelf(checked === true)}
                        />
                        <Label htmlFor="is_self" className="cursor-pointer font-bold text-lg">
                            Send to my email
                        </Label>
                    </div>
                )}
                {(requireRecipientEmail || !isSelf) && (
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {requireRecipientEmail ? "Customer Email Address" : "Email Address"}
                        </Label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="w-full h-10 rounded-[5px] border border-[#ADABAB] px-3"
                            required
                            autoComplete="off"
                        />
                    </div>
                )}
                <Button
                    type="submit"
                    className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C]"
                    loading={submitMutation.isPending}>
                    Send
                </Button>
            </form>
        </div>
    )
}

export const ConfirmationDialog = ({
    open,
    onOpenChange,
    title,
    description,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    confirmButtonClassName,
    cancelButtonClassName,
    onConfirm,
    onCancel,
    isPending = false,
    icon,
}: ConfirmationDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    {icon && <div className="mb-2 flex justify-center">{icon}</div>}
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        variant="ghost"
                        onClick={onCancel}
                        className={cn(CONFIRMATION_DIALOG_CANCEL_CLASSES, cancelButtonClassName)}>
                        {cancelButtonText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        className={cn(CONFIRMATION_DIALOG_CONFIRM_CLASSES, confirmButtonClassName)}
                        onClick={onConfirm}
                        disabled={isPending}>
                        {isPending ? "Processing..." : confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export const SendInvoiceViaEmail = ({
    componentProps,
    handleDialogContextSwitch
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const requireRecipientEmail = componentProps?.requireRecipientEmail === true
    const [isSelf, setIsSelf] = useState(false)
    // const [email, setEmail] = useState("")
    const [isSingle, setIsSingle] = useState(false)

    // useEffect(() => {
    //     if (!requireRecipientEmail) return

    //     const prefilled =
    //         componentProps?.defaultEmail?.trim() ||
    //         sessionStorage.getItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY)?.trim() ||
    //         ""
    //     if (prefilled && prefilled !== email) {
    //         setEmail(prefilled)
    //     }
    // }, [requireRecipientEmail, componentProps?.defaultEmail])

    const [email, setEmail] = useState<string>(() => {
        if (!requireRecipientEmail) return "";
        const prefilled =
            componentProps?.defaultEmail?.trim() ||
            sessionStorage.getItem(ADMIN_MOTOR_CUSTOMER_EMAIL_KEY)?.trim() ||
            "";
        return prefilled;
    });

    const submitMutation = UseApiMutation<SubmitResponse, FormData>({
        url: `document/motor/send-invoice-via-email`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Sent successfully!")
                setEmail(requireRecipientEmail ? email : "")
                setIsSelf(false)
                componentProps?.refetch?.()
                handleDialogContextSwitch({ refetch: true })
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Sending failed!")
            },
        },
    });
    const purchaseId = componentProps?.data;
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!purchaseId) {
            ShowToast.error("No active purchase session found.")
            return
        }
        const trimmedEmail = email.trim()
        if (requireRecipientEmail && !trimmedEmail) {
            ShowToast.error("Please enter the customer email address.")
            return
        }
        const is_single = isSingle;
        const sendToSelf = requireRecipientEmail ? false : isSelf
        const base: Record<string, unknown> = {
            is_self: sendToSelf,
            is_single: is_single,
        }
        if (!sendToSelf) {
            base.email = trimmedEmail
        }
        base.purchase_id = purchaseId ?? "";
        submitMutation.mutate(base as any)
    }

    return (
        <div className="w-full min-w-75 max-w-100 space-y-6 p-6">
            <div className="border-b pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        {requireRecipientEmail
                            ? "Send invoice to customer email"
                            : "Share Via Email To Either Self or Another User"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {requireRecipientEmail
                            ? "Enter the customer email address. The invoice will be sent to this address."
                            : "Enter the email address you want to share the documents with. You can also choose to send the documents to yourself."}
                    </p>
                </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                {!requireRecipientEmail && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_self"
                            checked={isSelf}
                            onCheckedChange={(checked) => setIsSelf(checked === true)}
                        />
                        <Label htmlFor="is_self" className="cursor-pointer font-bold text-lg">
                            Send to my email
                        </Label>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_single"
                        checked={isSingle}
                        onCheckedChange={(checked) => setIsSingle(checked === true)}
                    />
                    <Label htmlFor="is_single" className="cursor-pointer font-bold text-lg">
                        Send as a single invoice
                    </Label>
                </div>

                {(requireRecipientEmail || !isSelf) && (
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {requireRecipientEmail ? "Customer Email Address" : "Email Address"}
                        </Label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="w-full h-10 rounded-[5px] border border-[#ADABAB] px-3"
                            required
                            autoComplete="off"
                        />
                    </div>
                )}
                <Button
                    type="submit"
                    className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C]"
                    loading={submitMutation.isPending}>
                    Send
                </Button>
            </form>
        </div>
    )
}

export const ChatFloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <div className="fixed bottom-6 right-6 z-1000">
                {isOpen ? (
                    <Button
                        className="transition-all duration-200 hover:brightness-110"
                        onClick={() => setIsOpen(false)}
                        style={{
                            width: '80px',
                            height: '80px',
                            opacity: 1,
                            borderTopLeftRadius: '30px',
                            borderTopRightRadius: '0px',
                            borderBottomRightRadius: '30px',
                            borderBottomLeftRadius: '30px',
                            background: '#FFFFFF',
                            border: '1px solid #BF203175',
                            boxShadow: '0px 4px 4px 0px #00000040',
                        }}
                        size="icon">
                        <X
                            {...{
                                size: 20,
                                className: "h-20 w-auto text-red-500"
                            }}
                        />
                    </Button>
                ) : (
                    <Button
                        className="transition-all duration-200 hover:brightness-110"
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: '60px',
                            height: '60px',
                            opacity: 1,
                            borderTopLeftRadius: '30px',
                            borderTopRightRadius: '0px',
                            borderBottomRightRadius: '30px',
                            borderBottomLeftRadius: '30px',
                            background: '#FFFFFF',
                            border: '1px solid #BF203175',
                            boxShadow: '0px 4px 4px 0px #00000040',
                        }}
                        size="icon">
                        <img
                            src='/logo/logo3.png'
                            alt="App Logo"
                            className={`h-8 w-auto object-cover`}
                        />
                    </Button>
                )}
            </div>
            {isOpen && <ChatIndexPage isOpen={isOpen} setIsOpen={setIsOpen} />}
        </>
    );
}

export const ProfileMenuItem = ({
    to,
    icon: Icon,
    label,
    onClick,
    className = "",
}: ProfileMenuItemProps) => {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex w-full items-center gap-2.5 border-b 
            border-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors ${className}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
        </Link>
    );
}

export const ReusableSwitchToggle = ({
    id,
    label,
    description,
    checked,
    defaultChecked,
    disabled = false,
    invalid = false,
    orientation = "horizontal",
    className = "",
    onCheckedChange,
}: ReusableSwitchToggleProps) => {
    return (
        <Field
            orientation={orientation}
            className={className}
            data-invalid={invalid || undefined}>
            <FieldContent>
                <FieldLabel htmlFor={id}>
                    {label}
                </FieldLabel>
                {description && (
                    <FieldDescription>
                        {description}
                    </FieldDescription>
                )}
            </FieldContent>
            <Switch
                id={id}
                checked={checked}
                defaultChecked={defaultChecked}
                disabled={disabled}
                aria-invalid={invalid}
                onCheckedChange={onCheckedChange}
            />
        </Field>
    )
}

export function ReusablePopover({
    trigger,
    children,
    className,
    align = "center",
    side = "bottom",
}: ReusablePopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                align={align}
                side={side}
                className={cn("min-w-30 w-fit p-0", className)}>
                {children}
            </PopoverContent>
        </Popover>
    );
}

export const ReusableTabComponent = <KeyType extends string>({
    Children = () => <></>,
    tabProps = {},
    className = "",
    defaultTab,
    header,
    tabs,
}: ReusableTabComponentProps<KeyType>) => {
    const { activeTab, tabList, activeTabComponent: ActiveTabComponent, switchTab,
    } = useTabs<KeyType>({
        defaultTab,
        tabs,
    });
    const onValueChange = (val: string) => switchTab(val as KeyType);
    return (
        <div className={cn("w-full flex flex-col gap-2 py-6")}>
            {header}
            <Tabs
                {...{
                    defaultValue: defaultTab,
                    value: activeTab,
                    onValueChange,
                }}>
                <div className="w-full flex items-center justify-between mb-2">
                    <TabsList
                        className={cn(
                            "bg-neutral-200 px-1.5 py-2 rounded-xl h-9",
                            className,
                        )}>
                        {tabList.map(({ title, key }) => (
                            <TabsTrigger
                                className={cn(
                                    "cursor-pointer rounded-sm px-3 py-1 transition-all duration-200 font-medium leading-5 text-sm h-7",
                                    "data-[state=active]:bg-white data-[state=active]:text-dark-brown data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800",
                                )}
                                {...{ value: key }}
                                key={key}
                            >
                                {title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {Children && <Children {...tabProps} />}
                </div>
                {ActiveTabComponent && (
                    <TabsContent value={activeTab} className="mt-4">
                        <ActiveTabComponent
                            {...{
                                ...tabProps,
                                filter: activeTab,
                                tab: activeTab,
                            }}
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};