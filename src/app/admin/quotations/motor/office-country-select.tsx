import { ReusableSingleSelectApiInput } from '@/dev/core'

type OfficeCountrySelectProps = {
    value?: string
    onChange: (value: string) => void
    /** Shown in the trigger when no country is explicitly selected (profile default). */
    defaultCountryName?: string
    label?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export const OfficeCountrySelect = ({
    value,
    onChange,
    defaultCountryName,
    label = 'Country',
    required = false,
    disabled = false,
    className,
}: OfficeCountrySelectProps) => {
    const placeholder =
        !value && defaultCountryName
            ? defaultCountryName
            : 'Select country...'
    // The country list is paged, so the selected country may not be on page 1.
    // Keep its name on the closed dropdown.
    const selectedOption =
        value && defaultCountryName
            ? { value: String(value), label: defaultCountryName }
            : undefined

    return (
        <ReusableSingleSelectApiInput
            url="taxonomies/geo/country"
            queryParams={{
                sort_by: 'name',
                direction: 'asc',
            }}
            value={value}
            onChange={onChange}
            label={label}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
            selectedOption={selectedOption}
        />
    )
}
