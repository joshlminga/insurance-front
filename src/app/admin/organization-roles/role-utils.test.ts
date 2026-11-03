import { describe, expect, it } from "vitest"

import { canChangeRole, isProtectedSuperAdminRole } from "./role-utils"

describe("canChangeRole", () => {
  it("lets only a super admin change a general role", () => {
    const generalRole = { is_general: true, is_editable: true }

    expect(canChangeRole(generalRole, true)).toBe(true)
    expect(canChangeRole(generalRole, false)).toBe(false)
  })

  it("does not treat a missing flag as permission to change a general role", () => {
    expect(canChangeRole({ is_general: true }, false)).toBe(false)
  })

  it("marks only the super_admin role as undeletable", () => {
    expect(isProtectedSuperAdminRole({ name: "super_admin" })).toBe(true)
    expect(isProtectedSuperAdminRole({ name: "owner" })).toBe(false)
  })

  it("follows is_editable for a location role", () => {
    expect(canChangeRole({ is_general: false, is_editable: true }, false)).toBe(true)
    expect(canChangeRole({ is_general: false, is_editable: false }, true)).toBe(false)
  })
})
