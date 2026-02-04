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
    ReusableStepperProps,
    RHFInputProps,
    TReusablePageProps,
    TRHFSelectProps,
    TTabsProps
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
import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { Button as ShadButton } from "@/components/ui/button"
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Controller, type FieldValues } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}: ReusableStepperProps) {
    const [currentStep, setCurrentStep] = useState(defaultStep)
    const goToStep = (step: number) => setCurrentStep(step)
    return (
        <Stepper value={currentStep} onValueChange={setCurrentStep} className={className}>
            <StepperNav className="flex items-start gap-2 mb-6">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    return (
                        <StepperItem
                            key={stepNumber}
                            step={stepNumber}
                            className="relative flex-1 items-start">
                            <StepperTrigger className="flex flex-col items-center justify-center gap-1 grow">
                                <StepperIndicator
                                    className={cn("h-[17px] w-[124px] rounded-[10px] transition-all",
                                        "bg-gray-300 data-[state=active]:bg-linear-to-r from-[#FFB3B3] via-[#FF8383] to-[#FF4545]")} />
                                <StepperTitle className="text-start font-semibold group-data-[state=inactive]/step:text-muted-foreground">
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
    autoComplete = "off",
    required = false,
    className
}: RHFInputProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={id}>{label}</FieldLabel>
                    <Input
                        {...field}
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        aria-invalid={fieldState.invalid}
                        required={required}
                        className={cn(
                            className,
                            fieldState.invalid && "border-red-500 focus-visible:ring-red-500"
                        )}
                    />
                    {fieldState.invalid && fieldState.error && (
                        <FieldError className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                        </FieldError>
                    )}
                </Field>
            )}
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
                                "w-full",
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
            <TabsList
                className={cn(
                    "h-[70px] w-[509px] rounded-[20px] border border-[#ADABAB] bg-white p-0 flex",
                    tabsListClassName
                )}>
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            disabled={tab.disabled}
                            className={cn(` h-full rounded-none first:rounded-l-[20px] last:rounded-r-[20px]  data-[state=active]:bg-[#C20C0C] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black flex items-center justify-center gap-2 text-lg font-medium`,
                                triggerClassName)}>
                            {Icon && (
                                <Icon
                                    size={tab.iconSize ?? 16}
                                    className="shrink-0"
                                />
                            )}
                            {tab.label}
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