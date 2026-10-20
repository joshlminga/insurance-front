import { describe, expect, it } from "vitest"
import { extractServerFieldErrors } from "./taxonomy-uniqueness"

describe("extractServerFieldErrors", () => {
  it("flattens Laravel 422 errors", () => {
    const errors = extractServerFieldErrors({
      response: {
        data: {
          errors: {
            name: ["A section with this name already exists."],
            title: ["A common benefit with this full title already exists."],
          },
        },
      },
    })

    expect(errors).toEqual([
      { name: "name", message: "A section with this name already exists." },
      {
        name: "title",
        message: "A common benefit with this full title already exists.",
      },
    ])
  })

  it("returns empty when there are no field errors", () => {
    expect(extractServerFieldErrors({})).toEqual([])
  })
})
