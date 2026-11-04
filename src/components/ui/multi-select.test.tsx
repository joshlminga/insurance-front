import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "./multi-select"

function ModulesField() {
  return (
    <div className="w-64">
      <MultiSelect values={["claims", "roles", "members"]} onValuesChange={() => {}}>
        <MultiSelectTrigger className="h-10 w-full">
          <MultiSelectValue placeholder="Select modules..." />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            <MultiSelectItem value="claims">Claims</MultiSelectItem>
            <MultiSelectItem value="roles">Roles</MultiSelectItem>
            <MultiSelectItem value="members">Members</MultiSelectItem>
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  )
}

describe("MultiSelect", () => {
  it("wraps selected chips inside the field instead of locking a single row", () => {
    Element.prototype.scrollIntoView = () => {}

    render(<ModulesField />)

    const trigger = screen.getByRole("combobox")

    expect(trigger.className).toContain("h-auto")
    expect(trigger.className).toContain("whitespace-normal")
    expect(trigger.className).toContain("min-w-0")
    expect(trigger.className).not.toMatch(/(?:^|\s)h-10(?:\s|$)/)

    const chips = trigger.querySelector("[class*='flex-wrap']")
    expect(chips).not.toBeNull()
    expect(chips?.querySelectorAll("[data-selected-item]")).toHaveLength(3)
    expect(chips).toHaveTextContent("Claims")
    expect(chips).toHaveTextContent("Roles")
    expect(chips).toHaveTextContent("Members")
  })
})
