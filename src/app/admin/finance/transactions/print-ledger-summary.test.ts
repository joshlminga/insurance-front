import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { printLedgerSummary } from './print-ledger-summary'

describe('printLedgerSummary', () => {
  const openSpy = vi.fn()

  beforeEach(() => {
    openSpy.mockReset()
    vi.stubGlobal('open', openSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes a printable table and calls print on the new window', () => {
    const write = vi.fn()
    const close = vi.fn()
    const focus = vi.fn()
    const print = vi.fn()
    const setTimeoutFn = vi.fn((cb: () => void) => {
      cb()
      return 0 as unknown as ReturnType<typeof setTimeout>
    })

    openSpy.mockReturnValue({
      document: { open: vi.fn(), write, close },
      focus,
      print,
      setTimeout: setTimeoutFn,
    })

    printLedgerSummary({
      title: 'Invoice INV-1',
      subtitle: 'DR and CR lines',
      rows: [
        {
          account: 'Bank / M-Pesa A/c',
          dr: '1500.00',
          cr: '0.00',
          type: 'payment',
        },
      ],
      footerNote: 'Invoices: INV-1',
    })

    expect(openSpy).toHaveBeenCalled()
    expect(write).toHaveBeenCalled()
    const html = String(write.mock.calls[0]?.[0] ?? '')
    expect(html).toContain('Invoice INV-1')
    expect(html).toContain('Bank / M-Pesa A/c')
    expect(html).toContain('1,500.00')
    expect(html).toContain('Invoices: INV-1')
    expect(print).toHaveBeenCalled()
  })
})
