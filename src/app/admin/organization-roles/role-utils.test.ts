import { describe, expect, it } from "vitest"

import {
  canChangeRole,
  getOrgLocationSlug,
  isProtectedSuperAdminRole,
} from "./role-utils"

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

describe("getOrgLocationSlug", () => {
  it("returns the slug when present", () => {
    expect(getOrgLocationSlug({ slug: "acme-nairobi", id: 1 })).toBe("acme-nairobi")
  })

  it("returns null when slug is missing so callers can fall back to id", () => {
    expect(getOrgLocationSlug({ id: 1 })).toBeNull()
    expect(getOrgLocationSlug({})).toBeNull()
  })
})
