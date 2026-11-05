import type { BenefitGroup } from '@/types/types'
import { BENEFIT_SELECT_NONE } from '@/utils/constatnts'
import { benefitGroupFormKey, isBenefitGroupLocked } from '@/utils/helpers'
import type { FieldValues } from 'react-hook-form'

/** True when every unlocked group is on "-- none --". Hard-locked groups are ignored. */
export function unlockedBenefitGroupsAreCleared(
    values: FieldValues,
    groups: BenefitGroup[],
): boolean {
    for (const { group, items } of groups) {
        if (isBenefitGroupLocked(items)) continue
        const raw = values[benefitGroupFormKey(group)]
        if (raw != null && raw !== '' && raw !== BENEFIT_SELECT_NONE) {
            return false
        }
    }
    return true
}

/** Set unlocked groups to "-- none --". Hard-locked org groups stay as they are. */
export function clearUnlockedBenefitValues(
    values: FieldValues,
    groups: BenefitGroup[],
): FieldValues {
    const next: FieldValues = { ...values }
    for (const { group, items } of groups) {
        // allow_unselect=false / locked org-mandatory: the dropdown is disabled.
        if (isBenefitGroupLocked(items)) continue
        next[benefitGroupFormKey(group)] = BENEFIT_SELECT_NONE
    }
    return next
}
