import { describe, expect, it } from 'vitest'
import { serializeMotorPremiumParams } from './motor-premium-params'

describe('serializeMotorPremiumParams benefit_ids', () => {
    it('emits an empty array as JSON [] and omits a missing key', () => {
        const cleared = serializeMotorPremiumParams({
            page: 1,
            benefit_ids: [],
        })
        expect(cleared).toContain('benefit_ids=%5B%5D')
        expect(cleared).not.toContain('benefit_ids%5B%5D=')

        const firstLoad = serializeMotorPremiumParams({
            page: 1,
        })
        expect(firstLoad).toBe('page=1')
        expect(firstLoad).not.toContain('benefit_ids')

        const omitted = serializeMotorPremiumParams({
            page: 1,
            benefit_ids: undefined,
        })
        expect(omitted).toBe('page=1')
    })

    it('keeps a non-empty list as repeated benefit_ids[] params', () => {
        expect(
            serializeMotorPremiumParams({
                benefit_ids: [12, 34],
            })
        ).toBe('benefit_ids%5B%5D=12&benefit_ids%5B%5D=34')
    })
})
