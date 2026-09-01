/**
 * Format guidance for policy-number rules.
 * Actual numbers are built on the API (DmvicCertificateAllocationService) — not in the browser.
 */
export function PolicyNumberRuleFormatHints() {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground space-y-2">
      <p className="font-medium text-foreground">Expected format (applied on the server)</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Template</strong> — full pattern, e.g.{' '}
          <code className="text-xs">HQ/0809/YYYY/01/05XXX</code>
        </li>
        <li>
          <strong>YYYY</strong> — current 4-digit year; <strong>MM</strong> — current 2-digit month
        </li>
        <li>
          <strong>Sequence placeholder</strong> — substring in the template for the running number
          (e.g. <code className="text-xs">XXX</code>). Must appear exactly in the template.
        </li>
        <li>
          <strong>Sequence start</strong> — digits only; the API zero-pads to the placeholder length (
          <code className="text-xs">1</code> with <code className="text-xs">XXX</code> becomes{' '}
          <code className="text-xs">001</code>).
        </li>
      </ul>
      <p className="text-xs">
        After saving, open the stock detail page to see the next policy number from the API.
      </p>
    </div>
  )
}
