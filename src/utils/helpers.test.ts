import { describe, expect, it } from "vitest"
import {
    canPurchaseCover,
    formatAllOrRange,
    formatMotorRateAge,
    formatMotorRateTonnage,
    formatMotorRateValue,
    formatOptionalDecimal,
    formatTaxonomyName,
    formatWholeNumber,
    getDmvicValidationOverrideError,
    mapMotorRateToFormValues,
    maxCoverEndDate,
    mergeSelectedOption,
    toFormDate,
    toFormId,
    toFormNumber,
} from "./helpers"

describe("getDmvicValidationOverrideError", () => {
    // Override dialog is temporarily disabled until ValidateDoubleInsurance is reliable.
    it("returns null even when can_proceed is true (dialog disabled)", () => {
        const result = getDmvicValidationOverrideError({
            response: {
                data: {
                    can_proceed: true,
                    errors: {
                        dmvic: [
                            "ER007: There is a 203 days gap between the previous insurance and the proposed one",
                            "ER005: Double Insurance",
                        ],
                    },
                },
            },
        })

        expect(result).toBeNull()
    })

    it("returns null when can_proceed is false or missing", () => {
        expect(
            getDmvicValidationOverrideError({
                response: {
                    data: {
                        can_proceed: false,
                        errors: { dmvic: ["ER003: Missing"] },
                    },
                },
            }),
        ).toBeNull()

        expect(
            getDmvicValidationOverrideError({
                response: {
                    data: {
                        errors: { dmvic: ["ER007: Gap"] },
                    },
                },
            }),
        ).toBeNull()
    })

    it("returns null when dmvic messages are empty", () => {
        expect(
            getDmvicValidationOverrideError({
                response: {
                    data: {
                        can_proceed: true,
                        errors: { dmvic: [] },
                    },
                },
            }),
        ).toBeNull()
    })
})

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

describe("formatTaxonomyName", () => {
    it("returns taxonomy name when present", () => {
        expect(formatTaxonomyName({ name: "Private" })).toBe("Private")
    })

    it("returns dash when name is missing", () => {
        expect(formatTaxonomyName(null)).toBe("-")
        expect(formatTaxonomyName({})).toBe("-")
    })
})

describe("formatOptionalDecimal", () => {
    it("returns dash for null values", () => {
        expect(formatOptionalDecimal(null)).toBe("-")
        expect(formatOptionalDecimal(undefined)).toBe("-")
    })

    it("formats numeric values", () => {
        expect(formatOptionalDecimal(5000)).toBe("5,000.00")
        expect(formatOptionalDecimal("0.025")).toBe("0.03")
    })
})

describe("formatWholeNumber", () => {
    it("formats without decimals and with commas", () => {
        expect(formatWholeNumber("500000.00")).toBe("500,000")
        expect(formatWholeNumber("5000000.00")).toBe("5,000,000")
    })

    it("returns dash for null values", () => {
        expect(formatWholeNumber(null)).toBe("-")
    })
})

describe("formatAllOrRange", () => {
    it('returns "All" when unrestricted flag is true', () => {
        expect(formatAllOrRange(true, null, null)).toBe("All")
    })

    it("returns range when flag is false and bounds exist", () => {
        expect(formatAllOrRange(false, 15, 22)).toBe("15 - 22")
    })

    it("defaults null from to 0 when to is present", () => {
        expect(formatAllOrRange(false, null, 15)).toBe("0 - 15")
    })

    it("returns dash when both bounds are missing", () => {
        expect(formatAllOrRange(false, null, null)).toBe("-")
    })
})

describe("formatMotorRateAge", () => {
    it("shows 0 - 15 when age_from is null and age_to is 15", () => {
        expect(formatMotorRateAge(false, null, 15)).toBe("0 - 15")
    })

    it('shows "All" when is_all_age is true', () => {
        expect(formatMotorRateAge(true, null, null)).toBe("All")
    })
})

describe("formatMotorRateValue", () => {
    it("formats value range as whole comma-separated numbers", () => {
        expect(formatMotorRateValue(false, "500000.00", "5000000.00")).toBe(
            "500,000 - 5,000,000",
        )
    })

    it('shows "All" when is_all_sum is true', () => {
        expect(formatMotorRateValue(true, null, null)).toBe("All")
    })
})

describe("formatMotorRateTonnage", () => {
    it("prefers used_tonnage taxonomy name", () => {
        expect(
            formatMotorRateTonnage({
                used_tonnage: { name: "Up to 3 Tonnes" },
                min_tonnage: 1,
                max_tonnage: 3,
            }),
        ).toBe("Up to 3 Tonnes")
    })

    it("falls back to min-max range", () => {
        expect(
            formatMotorRateTonnage({
                min_tonnage: 1,
                max_tonnage: 3,
            }),
        ).toBe("1 - 3")
    })

    it("returns dash when no tonnage data", () => {
        expect(formatMotorRateTonnage({})).toBe("-")
    })
})

describe("toFormId", () => {
    it("returns empty string for nullish values", () => {
        expect(toFormId(null)).toBe("")
        expect(toFormId(undefined)).toBe("")
        expect(toFormId("")).toBe("")
    })

    it("stringifies numeric ids", () => {
        expect(toFormId(42)).toBe("42")
    })
})

describe("toFormNumber", () => {
    it("returns empty string for nullish values", () => {
        expect(toFormNumber(null)).toBe("")
        expect(toFormNumber(undefined)).toBe("")
    })

    it("stringifies numbers for inputs", () => {
        expect(toFormNumber(600000)).toBe("600000")
        expect(toFormNumber("0.025")).toBe("0.025")
    })
})

describe("toFormDate", () => {
    it("returns YYYY-MM-DD slice for datetime strings", () => {
        expect(toFormDate("2026-01-15T00:00:00.000000Z")).toBe("2026-01-15")
    })
})

describe("mergeSelectedOption", () => {
    it("prepends missing selected option", () => {
        const options = [{ value: "2", label: "Other" }]
        const merged = mergeSelectedOption(options, { value: "1", label: "Saved" }, "1")

        expect(merged).toHaveLength(2)
        expect(merged[0]).toEqual({ value: "1", label: "Saved" })
    })
})

describe("maxCoverEndDate", () => {
    it("returns same day next year minus 1 day (18 Sep → 17 Sep)", () => {
        expect(maxCoverEndDate("2026-09-18", 12)).toBe("2027-09-17")
    })

    it("returns last day of previous month for 1 Sep start (31 Aug)", () => {
        expect(maxCoverEndDate("2026-09-01", 12)).toBe("2027-08-31")
    })

    it("supports one-month cover windows", () => {
        expect(maxCoverEndDate("2026-09-18", 1)).toBe("2026-10-17")
    })
})

describe("mapMotorRateToFormValues", () => {
    it("maps nested taxonomies and meta into form defaults", () => {
        const values = mapMotorRateToFormValues({
            coverfor: { id: 10, name: "Private" },
            covertype_id: 20,
            valued_from: "600000.00",
            start_date: "2026-03-01T00:00:00.000000Z",
            meta: {
                makemodel_offered: [{ id: 5, name: "Toyota - Corolla" }],
            },
        })

        expect(values.coverfor_id).toBe("10")
        expect(values.covertype_id).toBe("20")
        expect(values.valued_from).toBe("600000.00")
        expect(values.start_date).toBe("2026-03-01")
        expect(values.makemodel_offered).toEqual([5])
    })
})
