import { describe, expect, it } from "vitest"
import { isNavItemActive, isPathActive } from "./nav-path-active"

describe("isPathActive", () => {
  it("matches exact url and nested children under url/", () => {
    expect(isPathActive("/dashboard/products/travel", "/dashboard/products/travel")).toBe(
      true
    )
    expect(
      isPathActive("/dashboard/products/travel/coverage", "/dashboard/products/travel")
    ).toBe(true)
  })

  it("does not treat sibling product families as the same prefix", () => {
    // After fix: Motor parent is /products/motor, not /products
    expect(isPathActive("/dashboard/products/travel", "/dashboard/products/motor")).toBe(
      false
    )
    expect(
      isPathActive("/dashboard/products/travel-benefits/1", "/dashboard/products/motor")
    ).toBe(false)
    expect(isPathActive("/dashboard/products/motor/cover-types", "/dashboard/products/motor")).toBe(
      true
    )
  })

  it("honors matchPrefixes for travel-rates and travel-benefits", () => {
    const prefixes = [
      "/dashboard/products/travel-rates",
      "/dashboard/products/travel-benefits",
    ]
    expect(
      isPathActive("/dashboard/products/travel-benefits/9", undefined, prefixes)
    ).toBe(true)
    expect(isPathActive("/dashboard/products/travel-rates/3", undefined, prefixes)).toBe(
      true
    )
    expect(isPathActive("/dashboard/products/motor", undefined, prefixes)).toBe(false)
  })
})

describe("isNavItemActive", () => {
  const motor = { url: "/dashboard/products/motor", items: [] }
  const travel = {
    url: "/dashboard/products/travel",
    matchPrefixes: [
      "/dashboard/products/travel-rates",
      "/dashboard/products/travel-benefits",
    ],
    items: [{ url: "/dashboard/products/travel/coverage" }],
  }

  it("marks Travel active and Motor inactive on travel product paths", () => {
    expect(isNavItemActive("/dashboard/products/travel", travel)).toBe(true)
    expect(isNavItemActive("/dashboard/products/travel", motor)).toBe(false)
    expect(isNavItemActive("/dashboard/products/travel-benefits/1", travel)).toBe(true)
    expect(isNavItemActive("/dashboard/products/travel-benefits/1", motor)).toBe(false)
  })
})
