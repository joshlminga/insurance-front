import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import type { AdminMotorQuotationFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import {
    AdminPhoneInput,
    resolveDialCode,
    type CountryGeoMeta,
} from './admin-phone-input'
import {
    buildFullPhone,
    isCustomerFound,
    isSelfCoverLookup,
    isValidEmail,
    normalizeLocalPhoneDigits,
    parseMeta,
    resolveFullName,
    searchCustomer,
    stripDialCode,
    type CustomerSearchUser,
} from './customer-lookup-utils'
import {
    motorCheckboxLabelAccentClassName,
    motorCheckboxLabelClassName,
    motorClearActionClassName,
    motorInputClass,
} from './motor-field-styles'

type CustomerDetailsSectionProps = {
    countryId: string
}

export function CustomerDetailsSection({ countryId }: CustomerDetailsSectionProps) {
    const { user: authUser } = UseAuth()
    const { control, setValue, getValues } =
        useFormContext<AdminMotorQuotationFormValues>()

    const [isCustomerLocked, setIsCustomerLocked] = useState(false)
    const [emailLookupFailed, setEmailLookupFailed] = useState(false)
    const [isSearchingEmail, setIsSearchingEmail] = useState(false)
    const [isSearchingPhone, setIsSearchingPhone] = useState(false)
    const [showSelfCoverWarning, setShowSelfCoverWarning] = useState(false)

    const lockedEmailRef = useRef('')

    const watchedEmail = useWatch({ control, name: 'email' })

    const { data: geoData } = UseApiQuery<SubmitResponse>({
        url: 'taxonomies/geo/country',
        params: { country_id: countryId },
        queryOptions: { enabled: Boolean(countryId) },
    })

    const countryGeo = (geoData?.data ?? [])[0] as CountryGeoMeta | undefined
    const dialCode = resolveDialCode(countryGeo)

    const applyFoundCustomer = useCallback(
        (user: CustomerSearchUser) => {
            const fullName = resolveFullName(user)
            const email = String(user.email ?? '').trim()
            const rawPhone = String(user.phone ?? parseMeta(user.meta).phone ?? '')
            const localPhone = stripDialCode(rawPhone, dialCode)

            setValue('full_name', fullName, { shouldDirty: true, shouldValidate: true })
            setValue('email', email, { shouldDirty: true, shouldValidate: true })
            setValue('phone', localPhone, { shouldDirty: true, shouldValidate: true })
            setValue('user_id', String(user.id), { shouldDirty: true, shouldValidate: true })

            lockedEmailRef.current = email
            setIsCustomerLocked(true)
            setEmailLookupFailed(false)
            setValue('create_customer_account', false, { shouldDirty: true })

            if (isSelfCoverLookup(user.id, authUser?.id)) {
                setShowSelfCoverWarning(true)
            }
        },
        [authUser?.id, dialCode, setValue]
    )

    const clearCustomerLock = useCallback(() => {
        setIsCustomerLocked(false)
        setEmailLookupFailed(false)
        lockedEmailRef.current = ''
        setValue('email', '', { shouldDirty: true, shouldValidate: true })
        setValue('full_name', '', { shouldDirty: true, shouldValidate: true })
        setValue('user_id', '', { shouldDirty: true, shouldValidate: true })
        setValue('phone', '', { shouldDirty: true, shouldValidate: true })
        setValue('create_customer_account', false, { shouldDirty: true })
    }, [setValue])

    const showCreateAccountOption = emailLookupFailed && !isCustomerLocked

    useEffect(() => {
        if (!isCustomerLocked || !lockedEmailRef.current) return
        const current = String(watchedEmail ?? '').trim()
        if (current !== lockedEmailRef.current) {
            clearCustomerLock()
        }
    }, [watchedEmail, isCustomerLocked, clearCustomerLock])

    useEffect(() => {
        if (isCustomerLocked) return
        setEmailLookupFailed(false)
    }, [watchedEmail, isCustomerLocked])

    const handleEmailBlur = async () => {
        if (isCustomerLocked || isSearchingEmail) return

        const email = String(getValues('email') ?? '').trim()
        if (!isValidEmail(email)) return

        setIsSearchingEmail(true)
        try {
            const response = await searchCustomer({ email })
            const user = response?.data as CustomerSearchUser | null

            if (isCustomerFound(user)) {
                applyFoundCustomer(user)
                return
            }

            setEmailLookupFailed(true)
        } catch (error) {
            ShowToast.error(extractErrorMessage(error))
            setEmailLookupFailed(true)
        } finally {
            setIsSearchingEmail(false)
        }
    }

    const handlePhoneBlur = async () => {
        if (isCustomerLocked || !emailLookupFailed || isSearchingPhone) return

        const localPhone = normalizeLocalPhoneDigits(String(getValues('phone') ?? ''))
        if (localPhone.length < 7) return
        setValue('phone', localPhone, { shouldDirty: true })
        if (!countryId || !dialCode) return

        const fullPhone = buildFullPhone(dialCode, localPhone)
        if (!fullPhone) return

        setIsSearchingPhone(true)
        try {
            const response = await searchCustomer({ phone: fullPhone })
            const user = response?.data as CustomerSearchUser | null

            if (isCustomerFound(user)) {
                applyFoundCustomer(user)
                return
            }
        } catch (error) {
            ShowToast.error(extractErrorMessage(error))
        } finally {
            setIsSearchingPhone(false)
        }
    }

    return (
        <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
            <div className="flex w-full flex-wrap items-start justify-between gap-3 pb-4">
                <div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                        Customer{' '}
                        <span className="text-[#C20C0C]">details</span>
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
                        Enter customer contact information for this quotation.
                    </p>
                </div>
                {isCustomerLocked && (
                    <Button
                        type="button"
                        variant="outline"
                        className={motorClearActionClassName}
                        onClick={clearCustomerLock}
                    >
                        Clear details
                    </Button>
                )}
            </div>

            {isCustomerLocked && (
                <p className="mb-3 text-xs font-medium text-[#8B0A0A]">
                    These fields were auto-filled from an existing customer and are locked.
                    Use <span className="font-semibold text-[#C20C0C]">Clear details</span> to
                    edit manually.
                </p>
            )}

            <FieldGroup className="[&_label]:text-sm [&_input]:text-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Controller
                        control={control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="customer-email">
                                    Email
                                    {isSearchingEmail && (
                                        <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                    )}
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="customer-email"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isCustomerLocked || isSearchingEmail}
                                    aria-invalid={fieldState.invalid}
                                    className={cn(
                                        motorInputClass(isCustomerLocked),
                                        fieldState.invalid &&
                                            'border-red-500 focus-visible:ring-red-500'
                                    )}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    onBlur={() => {
                                        field.onBlur()
                                        void handleEmailBlur()
                                    }}
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError className="mt-1 text-sm text-red-500">
                                        {fieldState.error.message}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <div className="relative">
                        {isSearchingPhone && (
                            <Loader2 className="absolute right-2 top-8 z-10 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <AdminPhoneInput
                            control={control}
                            name="phone"
                            countryId={countryId}
                            label="Mobile Number"
                            disabled={isCustomerLocked || isSearchingPhone}
                            autofilled={isCustomerLocked}
                            onBlur={() => void handlePhoneBlur()}
                        />
                    </div>

                    <ReuseableInput
                        className={motorInputClass(isCustomerLocked)}
                        control={control}
                        name="full_name"
                        label="Full Name"
                        disabled={isCustomerLocked}
                    />
                </div>

                {showCreateAccountOption && (
                    <Controller
                        control={control}
                        name="create_customer_account"
                        render={({ field }) => (
                            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#C20C0C]/25 bg-[#FFFBFB] p-3 sm:p-4">
                                <Checkbox
                                    id="create-customer-account"
                                    checked={Boolean(field.value)}
                                    onCheckedChange={(checked) =>
                                        field.onChange(checked === true)
                                    }
                                    className="mt-0.5 h-4 w-4 rounded-[3px] border border-[#D9D9D9] data-[state=checked]:border-[#C20C0C] data-[state=checked]:bg-[#C20C0C]"
                                />
                                <label
                                    htmlFor="create-customer-account"
                                    className={motorCheckboxLabelClassName}
                                >
                                    <span className={motorCheckboxLabelAccentClassName}>
                                        Create account
                                    </span>{' '}
                                    for this customer
                                </label>
                            </div>
                        )}
                    />
                )}
            </FieldGroup>

            <AlertDialog
                open={showSelfCoverWarning}
                onOpenChange={setShowSelfCoverWarning}
            >
                <AlertDialogContent size="sm" className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Issuing cover for yourself</AlertDialogTitle>
                        <AlertDialogDescription>
                            The customer details match your logged-in account. You are
                            issuing a cover for yourself. Close this message to continue
                            with the quotation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="rounded-full bg-[#C20C0C] hover:bg-[#C20C0C]/90"
                            onClick={() => setShowSelfCoverWarning(false)}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
