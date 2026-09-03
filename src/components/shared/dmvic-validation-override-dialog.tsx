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

type DmvicValidationOverrideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Full "ER007: message" lines from the API */
  messages: string[]
  onConfirm: () => void
  isPending?: boolean
}

/**
 * Shown when DMVIC cover validation returns only overridable errors (ER005 / ER007).
 * Cancel keeps the user on the form; Continue resubmits with override flags.
 */
export function DmvicValidationOverrideDialog({
  open,
  onOpenChange,
  messages,
  onConfirm,
  isPending = false,
}: DmvicValidationOverrideDialogProps) {
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              // Keep dialog open while the retry mutation runs
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? "Continuing..." : "Continue regardless"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
