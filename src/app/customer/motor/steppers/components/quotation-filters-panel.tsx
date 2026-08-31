import { ReusableSelect } from '@/dev/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { QuotationFiltersPanelProps } from '@/types/types'
import { BENEFIT_SELECT_NONE } from '@/utils/constatnts'
import { benefitGroupFormKey, benefitOptionLabel } from '@/utils/helpers'
import type { FieldValues, Path } from 'react-hook-form'

export function QuotationFiltersPanel({
    idPrefix = 'quotation',
    quoteSessionId,
    isPending,
    isFetching,
    data,
    benefitGroups,
    benefitFormControl,
    priceRange,
    onPriceRangeChange,
    className,
}: QuotationFiltersPanelProps) {
    const searchId = `${idPrefix}-insurer-search`
    const sliderId = `${idPrefix}-price-slider`

    return (
        <div className={className}>
            <div className="mb-5 grid gap-2">
                <Label htmlFor={searchId}>Search by Insurer</Label>
                <Input
                    id={searchId}
                    name="search"
                    type="text"
                    placeholder="Enter insurer name..."
                    className="h-11 w-full rounded-[5px] border border-[#ADABAB] sm:h-10"
                />
            </div>

            <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                Additional benefits
            </h2>
            <hr className="mb-5" />

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {!quoteSessionId ? null : isPending && !data && benefitGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading benefit options…</p>
                ) : benefitGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No optional benefits are available for this quote yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {benefitGroups.map(({ group, items }) => {
                            const fieldName = benefitGroupFormKey(group)
                            const options = [
                                { value: BENEFIT_SELECT_NONE, label: '-- none --' },
                                ...items.map((item) => ({
                                    value: String(item.id),
                                    label: benefitOptionLabel(item),
                                })),
                            ]
                            return (
                                <ReusableSelect
                                    key={group}
                                    control={benefitFormControl}
                                    name={fieldName as Path<FieldValues>}
                                    label={group}
                                    placeholder={`Choose in ${group}`}
                                    options={options}
                                    disabled={isFetching}
                                    triggerClassName="border-[#ADABAB]"
                                />
                            )
                        })}
                    </div>
                )}
            </form>
            <hr className="my-5" />
            <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                Price Range
            </h2>
            <div className="grid w-full gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={sliderId}>Price</Label>
                    <span className="text-sm text-muted-foreground">
                        {priceRange.join(', ')}
                    </span>
                </div>
                <Slider
                    id={sliderId}
                    value={priceRange}
                    onValueChange={onPriceRangeChange}
                    min={0}
                    max={100}
                    step={0.1}
                />
            </div>
        </div>
    )
}
