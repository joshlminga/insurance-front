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
    TPaginationFilters
} from "@/types/types";
import {
    Stepper,
    StepperContent,
    StepperIndicator,
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
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Controller, type FieldValues } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { UseApiQuery } from "@/hooks/hooks";
import { Label } from "@/components/ui/label";
import { EORGANIZATIONTYPES, FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";

const formatSegment = (segment: string) => {
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BreadCrumbComponent = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <div className="w-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathSegments.map((segment, index) => {
                        const href = '/' + pathSegments.slice(0, index + 1).join('/');
                        const isLast = index === pathSegments.length - 1;
                        const title = formatSegment(segment);
                        return (
                            <Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to={href}>{title}</Link>
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
                                <StepperIndicator
                                    className={cn("h-2 sm:h-4.25 w-full max-w-20 sm:max-w-31 rounded-[10px] transition-all",
                                        "bg-gray-300 data-[state=active]:bg-linear-to-r from-[#FFB3B3] via-[#FF8383] to-[#FF4545]")} />
                                <StepperTitle className="hidden sm:block text-start text-xs lg:text-sm font-semibold group-data-[state=inactive]/step:text-muted-foreground truncate max-w-25 lg:max-w-none">
                                    {step.title}
                                </StepperTitle>
                                <span className="sm:hidden text-[10px] font-medium text-muted-foreground">
                                    {stepNumber}
                                </span>
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
    autoComplete = "off",
    required = false,
    disabled = false,
    className,
    rows,
}: RHFInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const isFile = type === "file"

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        <Input
                            {...(!isFile ? field : {})}
                            id={id}
                            type={type}
                            step={step}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            aria-invalid={fieldState.invalid}
                            required={required}
                            disabled={disabled}
                            className={cn(
                                className,
                                fieldState.invalid &&
                                "border-red-500 focus-visible:ring-red-500"
                            )}
                            onChange={(e) => {
                                if (isFile) {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    field.onChange(file)
                                } else {
                                    field.onChange(e)
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
                                    "w-full h-12.75 rounded-[5px]]",
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
            className={`grid gap-8 grid-cols-${columns} ${className}`}>
            {options.map((option) => (
                <div
                    key={option.id}
                    className="flex items-start gap-2 mt-2">
                    <Checkbox
                        checked={option.checked}
                        name={name}
                        onCheckedChange={(val) =>
                            option.onChange?.(Boolean(val))
                        }
                        className="w-3.75 h-3.75 rounded-[3px] border border-[#D9D9D9]
                       data-[state=checked]:bg-[#C20C0C]
                       data-[state=checked]:border-[#C20C0C]"
                    />
                    <label className="cursor-pointer max-w-112.25">
                        {option?.label}
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
}: ReusableCardProps) => {
    const isClickable = Boolean(onClick) && !disabled;
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
            className={cn("flex flex-col w-full min-w-0 overflow-hidden rounded-[10px] border bg-white",
                "border-[#ADABAB]",
                isClickable &&
                "cursor-pointer transition-all hover:border-[#FF9A9A] hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-[#FF9A9A]",
                selected && "ring-2 ring-primary",
                disabled && "opacity-50 cursor-not-allowed",
                rootClassName
            )}>
            {header && (
                <CardHeader className={cn('flex items-center justify-center p-3 text-center', headerClassName)}>
                    {header.type === 'image' && (
                        <div className="w-27.25 h-15 flex items-center justify-center">
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
}: Pick<
    TCustomDialogProps<T>,
    "children" | "dialogOpen" | "handleDialogContextSwitch" | "className"
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
                        ? "flex gap-6"
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
                                "cursor-pointer rounded-lg border p-4 transition-all",
                                contentPosition === "inline"
                                    ? "flex items-center justify-between gap-4"
                                    : "flex flex-col gap-3",
                                item.disabled &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                                borderColor: isActive ? activeColor : undefined,
                                backgroundColor: isActive
                                    ? `${activeColor}10`
                                    : undefined,
                            }}>
                            {showSelector && selectorPosition === "left" && (
                                <RadioGroupItem
                                    value={item.value}
                                    disabled={item.disabled}
                                    className="mr-3"
                                    style={{
                                        borderColor: isActive
                                            ? activeColor
                                            : undefined,
                                    }}
                                />
                            )}
                            <div className="flex items-center gap-3 flex-1">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.label}
                                        className="h-8 w-10 object-contain"
                                    />
                                )}

                                {Icon && (
                                    <Icon
                                        size={item.iconSize ?? 18}
                                        color={
                                            isActive ? activeColor : undefined
                                        }
                                    />)}
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
                            </div>
                            {showSelector &&
                                selectorPosition === "right" && (
                                    <RadioGroupItem
                                        value={item.value}
                                        disabled={item.disabled}
                                        style={{
                                            borderColor: isActive
                                                ? activeColor
                                                : undefined,
                                        }}
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
    font-medium text-center cursor-pointer w-10 h-10 ${active ? 'bg-[#F9F5FF] text-[#7F56D9]' : 'text-main-orange'
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
                <MultiSelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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

{/* export function ReuseableSingleSelectCountriesInput<T extends FieldValues>({
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
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );

    const { data, isLoading } = UseApiQuery<TCountryResponse>({
        url: "taxonomies/general/countries",
        params: {
            direction: "asc",
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term
        },
        queryOptions: { enabled: true },
    })

    const countries = data?.data ?? []

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
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={isLoading ? "Loading countries..." : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    {countries.map((country) => (
                        <SelectItem key={country.id} value={String(country.id)}>
                            {country?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && countries.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No countries found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
} */}

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
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
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

            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={
                            isLoading
                                ? "Loading countries..."
                                : placeholder
                        }
                    />
                </SelectTrigger>
                <SelectContent className="max-h-75">
                    <div className="p-2 sticky top-0 bg-white z-10">
                        <Input
                            placeholder="Search country..."
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-8"
                        />
                    </div>
                    {countries.map((country) => (
                        <SelectItem
                            key={country.id}
                            value={String(country.id)}>
                            {country.name}
                        </SelectItem>
                    ))}
                    {isLoading && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            Loading...
                        </div>
                    )}
                    {!isLoading && countries.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No countries found
                        </div>
                    )}
                    <div ref={observerRef} className="h-4" />
                </SelectContent>
            </Select>
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
    const users = data?.data?.users ?? []
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
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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

    console.log(organizations);

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
                <MultiSelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}>
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search vehicle use..."
                            className="h-9"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    {isFetching && (
                        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {vehicleUse.map((item: any) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                            {item?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && !isFetching && vehicleUse.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No vehicle use found
                        </div>
                    )}
                </SelectContent>
            </Select>
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
                <MultiSelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
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
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}>
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search vehicle use..."
                            className="h-9"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    {isFetching && (
                        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {covering.map((item: any) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                            {item?.name}
                        </SelectItem>
                    ))}
                    {!isLoading && !isFetching && covering.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No covering use found
                        </div>
                    )}
                </SelectContent>
            </Select>
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
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}>
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    <div className="p-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>

                    {isFetching && (
                        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {items.map((item: any) => (
                        <SelectItem
                            key={item[valueKey]}
                            value={String(item[valueKey])}
                        >
                            {item[labelKey]}
                        </SelectItem>
                    ))}

                    {!isLoading && !isFetching && items.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    )}
                </SelectContent>
            </Select>
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
                <MultiSelectTrigger disabled={disabled} className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <MultiSelectValue placeholder={placeholder} />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <div className="p-1">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
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
                                key={item[valueKey]}
                                value={String(item[valueKey])}>
                                {item[labelKey]}
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
