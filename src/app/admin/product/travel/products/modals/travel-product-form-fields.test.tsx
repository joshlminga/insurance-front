import { TravelProductSchema } from "@/types/form-schema"
import type { TravelProductFormValues } from "@/types/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { TravelProductFormFields } from "./travel-product-form-fields"
import { emptyTravelProductFormValues } from "./travel-product-form-utils"

vi.mock("@/hooks/hooks", () => ({
  UseApiQuery: () => ({
    data: { data: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  UseApiMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

const apiQuestionLabels = [
  "Quotation API",
  "Policy API",
  "Payment API",
  "Certificate API",
]

function TravelProductFormHarness() {
  const form = useForm<TravelProductFormValues>({
    resolver: zodResolver(TravelProductSchema),
    defaultValues: emptyTravelProductFormValues(),
  })

  return <TravelProductFormFields form={form} />
}

/** Click the Yes or No radio for a labeled YesNoRadio field. */
async function chooseYesNo(label: string, answer: "Yes" | "No") {
  const user = userEvent.setup()
  const fieldLabel = screen.getByText(label)
  const field = fieldLabel.closest("div")
  if (!field) {
    throw new Error(`Missing field ${label}`)
  }

  const radios = field.querySelectorAll('button[role="radio"]')
  const target = Array.from(radios).find((radio) => {
    const id = radio.getAttribute("id") ?? ""
    return answer === "Yes" ? id.endsWith("-yes") : id.endsWith("-no")
  })

  if (!target) {
    throw new Error(`Missing ${answer} radio for ${label}`)
  }

  await user.click(target)
}

describe("TravelProductFormFields rules questions", () => {
  it("hides the four API questions until the product has rules", async () => {
    render(<TravelProductFormHarness />)

    for (const label of apiQuestionLabels) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }

    await chooseYesNo("Does Product Have Rules?", "Yes")

    for (const label of apiQuestionLabels) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }

    await chooseYesNo("Does Product Have Rules?", "No")

    for (const label of apiQuestionLabels) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
  })

  it("hides target organizations when the product is public", async () => {
    render(<TravelProductFormHarness />)

    expect(screen.getByText("Target Organizations")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "+ Add organization" })).toBeInTheDocument()

    await chooseYesNo("Public Product (Accessible by All)", "Yes")

    expect(screen.queryByText("Target Organizations")).not.toBeInTheDocument()
  })

  it("hides coverages when the cover is external", async () => {
    render(<TravelProductFormHarness />)

    expect(screen.getByText("Coverages", { exact: false })).toBeInTheDocument()

    await chooseYesNo("External cover", "Yes")

    expect(screen.queryByText("Coverages", { exact: false })).not.toBeInTheDocument()

    await chooseYesNo("External cover", "No")

    expect(screen.getByText("Coverages", { exact: false })).toBeInTheDocument()
  })
})
