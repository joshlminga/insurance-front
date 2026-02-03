import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { ButtonProps, ReusableStepperProps, TReusablePageProps } from "@/types/types";
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
import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import React from "react";
import { Button as ShadButton } from "@/components/ui/button"
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
                    <div className="flex-shrink-0">
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
    return (
        <Stepper defaultValue={defaultStep} className={className}>
            <StepperNav className="gap-3.5 mb-15">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    return (
                        <StepperItem
                            key={stepNumber}
                            step={stepNumber}
                            className="relative flex-1 items-start"
                        >
                            <StepperTrigger className="flex flex-col items-start justify-center gap-3.5 grow">
                                <StepperIndicator className="bg-border rounded-full h-1 w-full data-[state=active]:bg-primary" />
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
                    return (
                        <StepperContent
                            key={stepNumber}
                            value={stepNumber}
                            className="w-full"
                        >
                            {step.content}
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