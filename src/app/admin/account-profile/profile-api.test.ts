import { afterEach, describe, expect, it, vi } from "vitest"
import {
  resolveMediaUrl,
  resolveUserAvatarUrl,
  toProfilePasswordPayload,
} from "./profile-api"

describe("toProfilePasswordPayload", () => {
  it("maps confirm_password to new_password_confirmation", () => {
    expect(
      toProfilePasswordPayload({
        current_password: "old-pass",
        new_password: "NewPassword1!",
        confirm_password: "NewPassword1!",
      })
    ).toEqual({
      current_password: "old-pass",
      new_password: "NewPassword1!",
      new_password_confirmation: "NewPassword1!",
    })
  })
})

describe("resolveMediaUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns empty string for empty input", () => {
    expect(resolveMediaUrl(null)).toBe("")
    expect(resolveMediaUrl(undefined)).toBe("")
    expect(resolveMediaUrl("")).toBe("")
  })

  it("returns absolute http(s) URLs unchanged", () => {
    expect(resolveMediaUrl("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg"
    )
    expect(resolveMediaUrl("http://localhost/a.jpg")).toBe("http://localhost/a.jpg")
  })

  it("prefixes relative paths with VITE_BASE_URL", () => {
    vi.stubEnv("VITE_BASE_URL", "https://sandbox.example.com/")
    expect(resolveMediaUrl("users/profile/2026/08/27/a.webp")).toBe(
      "https://sandbox.example.com/users/profile/2026/08/27/a.webp"
    )
  })

  it("avoids double slashes when joining base and path", () => {
    vi.stubEnv("VITE_BASE_URL", "https://sandbox.example.com/")
    expect(resolveMediaUrl("/users/profile/a.webp")).toBe(
      "https://sandbox.example.com/users/profile/a.webp"
    )
  })
})

describe("resolveUserAvatarUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("prefers flat avatar field", () => {
    vi.stubEnv("VITE_BASE_URL", "https://cdn.example.com")
    expect(
      resolveUserAvatarUrl({
        avatar: "users/profile/a.webp",
        meta: [{ key: "profile_picture", value: "users/profile/other.webp" }],
      })
    ).toBe("https://cdn.example.com/users/profile/a.webp")
  })

  it("falls back to meta profile_picture array shape", () => {
    vi.stubEnv("VITE_BASE_URL", "https://cdn.example.com")
    expect(
      resolveUserAvatarUrl({
        meta: [{ key: "profile_picture", value: "users/profile/from-meta.webp" }],
      })
    ).toBe("https://cdn.example.com/users/profile/from-meta.webp")
  })

  it("falls back to meta object shape", () => {
    vi.stubEnv("VITE_BASE_URL", "https://cdn.example.com")
    expect(
      resolveUserAvatarUrl({
        meta: { profile_picture: "users/profile/obj.webp" },
      })
    ).toBe("https://cdn.example.com/users/profile/obj.webp")
  })
})
