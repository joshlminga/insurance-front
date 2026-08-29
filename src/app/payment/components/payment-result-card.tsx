import type { ReactNode } from 'react'
import { Button } from '@/dev/core'
import { cn } from '@/lib/utils'
import { CircleAlert, CircleCheckBig, Clock } from 'lucide-react'

export type PaymentResultVariant = 'success' | 'failed' | 'pending'

type PaymentResultCardProps = {
    variant: PaymentResultVariant
    methodLabel: string
    title: string
    description: string
    primaryLabel?: string
    onPrimaryClick?: () => void
    helperText?: string
    children?: ReactNode
}

const variantStyles: Record<
    PaymentResultVariant,
    { iconWrap: string; icon: typeof CircleCheckBig; headingAccent: string }
> = {
    success: {
        iconWrap: 'bg-[#C20C0C]/10',
        icon: CircleCheckBig,
        headingAccent: 'text-[#C20C0C]',
    },
    failed: {
        iconWrap: 'bg-red-100',
        icon: CircleAlert,
        headingAccent: 'text-[#C20C0C]',
    },
    pending: {
        iconWrap: 'bg-amber-100',
        icon: Clock,
        headingAccent: 'text-amber-800',
    },
}

/**
 * One card used by every payment outcome page (success / failed / pending).
 * Pass different title/copy per method — the layout stays the same.
 */
export const PaymentResultCard = ({
    variant,
    methodLabel,
    title,
    description,
    primaryLabel,
    onPrimaryClick,
    helperText,
    children,
}: PaymentResultCardProps) => {
    const style = variantStyles[variant]
    const Icon = style.icon

    return (
        <section className="w-full max-w-xl mx-auto mt-16 sm:mt-24 lg:mt-32 mb-10 bg-transparent">
            <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                <div className="w-full pb-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                        {methodLabel}{' '}
                        <span className={style.headingAccent}>
                            {variant === 'success' ? 'Success' : variant === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                    </h1>
                </div>

                <div className="mt-5 space-y-5">
                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-6 text-center sm:p-8">
                        <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', style.iconWrap)}>
                            <Icon className={cn('h-10 w-10', style.headingAccent)} strokeWidth={1.75} />
                        </div>
                        <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
                        {helperText ? (
                            <p className="mx-auto mt-3 text-sm font-medium text-neutral-700">{helperText}</p>
                        ) : null}
                        {primaryLabel && onPrimaryClick ? (
                            <Button
                                type="button"
                                className="mt-6 w-full rounded-full bg-[#C20C0C]/90 text-white hover:bg-[#C20C0C] sm:w-auto"
                                onClick={onPrimaryClick}
                            >
                                {primaryLabel}
                            </Button>
                        ) : null}
                    </div>
                    {children}
                </div>
            </div>
        </section>
    )
}
