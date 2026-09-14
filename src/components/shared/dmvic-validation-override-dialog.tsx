import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

/** Values collected when the user confirms the DMVIC override popup */
export type DmvicValidationOverrideConfirmValues = {
  is_logbook_verified: true
  additional_comments: string
}

type DmvicValidationOverrideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Full "ER007: message" lines from the API */
  messages: string[]
  onConfirm: (values: DmvicValidationOverrideConfirmValues) => void
  isPending?: boolean
}

/**
 * Shown when DMVIC cover validation returns only overridable ER007 gap errors.
 * Cancel keeps the user on the form; Continue resubmits with override flags.
 * User must check "Is logbook verified" before Continue is enabled.
 */
export function DmvicValidationOverrideDialog({
  open,
  onOpenChange,
  messages,
  onConfirm,
  isPending = false,
}: DmvicValidationOverrideDialogProps) {
  const [isLogbookVerified, setIsLogbookVerified] = useState(false)
  const [additionalComments, setAdditionalComments] = useState("")

  // Reset local form when the dialog closes so the next open starts clean
  useEffect(() => {
    if (!open) {
      setIsLogbookVerified(false)
      setAdditionalComments("")
    }
  }, [open])

  const canContinue = isLogbookVerified && !isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>DMVIC cover validation warnings</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                DMVIC reported the issues below. You can continue issuance regardless,
                or cancel and correct the vehicle / cover details first.
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-left text-foreground">
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 px-1">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[#C20C0C]">
            <Checkbox
              checked={isLogbookVerified}
              disabled={isPending}
              onCheckedChange={(checked) => setIsLogbookVerified(checked === true)}
              className="mt-0.5 border-[#C20C0C] data-[state=checked]:border-[#C20C0C] data-[state=checked]:bg-[#C20C0C]"
            />
            <span>
              Is logbook verified
              <span className="mt-0.5 block text-xs text-[#C20C0C]">
                Required before you can continue.
              </span>
            </span>
          </label>

          <div className="space-y-1.5">
            <label
              htmlFor="dmvic-additional-comments"
              className="text-sm font-medium text-foreground"
            >
              Additional comments <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="dmvic-additional-comments"
              value={additionalComments}
              disabled={isPending}
              maxLength={200}
              placeholder="Optional note for DMVIC confirmation"
              className="border-black focus-visible:ring-black"
              onChange={(event) => setAdditionalComments(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {additionalComments.length}/200
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canContinue}
            onClick={(event) => {
              // Keep dialog open while the retry mutation runs
              event.preventDefault()
              if (!isLogbookVerified) {
                return
              }
              onConfirm({
                is_logbook_verified: true,
                additional_comments: additionalComments.trim(),
              })
            }}
          >
            {isPending ? "Continuing..." : "Continue regardless"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
