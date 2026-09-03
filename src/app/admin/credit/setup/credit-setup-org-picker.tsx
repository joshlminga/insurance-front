import { BypassOrgLocationPicker } from '@/components/shared/bypass-org-location-picker'
import { EORGANIZATIONTYPES } from '@/utils/constatnts'

/** Credit pool org types: Company, Organization, Partner (excludes Agent and Insurer). */
const CREDIT_SETUP_ORGANIZATION_TYPES = [
  EORGANIZATIONTYPES.COMPANY,
  EORGANIZATIONTYPES.ORGANIZATION,
  EORGANIZATIONTYPES.PARTNER,
] as const

type CreditSetupOrgPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Lets super admins choose which organization location credit setup applies to.
 * Loads locations filtered to Company / Organization / Partner only.
 */
export function CreditSetupOrgPicker({
  value,
  onChange,
  className,
}: CreditSetupOrgPickerProps) {
  return (
    <BypassOrgLocationPicker
      value={value}
      onChange={onChange}
      className={className}
      organizationTypes={[...CREDIT_SETUP_ORGANIZATION_TYPES]}
      hint="Pool settings and user allocations apply to the selected location only."
    />
  )
}
