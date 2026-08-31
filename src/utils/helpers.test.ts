import { describe, expect, it } from "vitest"
import { canPurchaseCover } from "./helpers"

describe("canPurchaseCover", () => {
    it("returns true only when allow_purchase is explicitly true", () => {
        expect(canPurchaseCover({ allow_purchase: true })).toBe(true)
    })

    it("returns false when allow_purchase is false", () => {
        expect(canPurchaseCover({ allow_purchase: false })).toBe(false)
    })

    it("returns false when allow_purchase is missing", () => {
        expect(canPurchaseCover({})).toBe(false)
        expect(canPurchaseCover(null)).toBe(false)
        expect(canPurchaseCover(undefined)).toBe(false)
    })
})
