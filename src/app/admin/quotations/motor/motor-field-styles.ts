import { cn } from '@/lib/utils'

/** Shared compact field sizing for admin motor quotation forms. */
export const motorInputClassName =
    'w-full h-10 rounded-[5px] border border-[#ADABAB]'

export const motorSelectTriggerClassName =
    'w-full h-10 rounded-[5px] border border-[#ADABAB]'

/** Targets API/select triggers inside reusable dev components. */
export const motorFormFieldStyles =
    '[&_[data-slot=select-trigger]]:h-10 [&_[data-slot=select-trigger]]:min-h-10'

/** Small, visible action text (Clear details, etc.). */
export const motorClearActionClassName =
    'h-auto shrink-0 rounded-md border border-[#C20C0C]/50 bg-white px-2.5 py-1 text-xs font-semibold text-[#C20C0C] shadow-none hover:border-[#C20C0C] hover:bg-[#C20C0C]/5 hover:text-[#9A0A0A]'

/** Checkbox option labels (Admin override, Create account). */
export const motorCheckboxLabelClassName =
    'cursor-pointer text-xs font-semibold leading-snug text-neutral-800 sm:text-sm'

/** Emphasized phrase inside checkbox labels. */
export const motorCheckboxLabelAccentClassName = 'text-[#C20C0C]'

/** Applied when customer lookup auto-fills and locks fields. */
export const motorAutofillHighlightClassName =
    'border-[#C20C0C]/45 bg-[#FFF8F8] text-neutral-900 shadow-[inset_0_0_0_1px_rgba(194,12,12,0.1)] disabled:cursor-not-allowed disabled:opacity-100'

export function motorInputClass(autofilled = false) {
    return cn(motorInputClassName, autofilled && motorAutofillHighlightClassName)
}
