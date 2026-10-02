import { describe, expect, it } from 'vitest'
import { EFINANCE_TRANSACTION_TABS } from '@/types/enums'
import {
  BuildFinanceTransactionsParams,
  FINANCE_TRANSACTIONS_URL,
  FinanceTransactionTabToView,
} from '@/app/admin/finance/transactions/finance-transactions-query'

describe('finance transactions query helpers', () => {
  it('exposes the expected list endpoint', () => {
    expect(FINANCE_TRANSACTIONS_URL).toBe('finance/transactions')
  })

  it('maps Per Invoice / Per Purchase tabs to API view values', () => {
    expect(FinanceTransactionTabToView(EFINANCE_TRANSACTION_TABS.PER_INVOICE)).toBe(
      'invoice'
    )
    expect(FinanceTransactionTabToView(EFINANCE_TRANSACTION_TABS.PER_PURCHASE)).toBe(
      'purchase'
    )
  })

  it('builds view/page/per_page/term params (maps pageSize → per_page)', () => {
    expect(
      BuildFinanceTransactionsParams({
        view: 'purchase',
        page: 2,
        pageSize: 15,
        term: 'Trade',
      })
    ).toEqual({
      view: 'purchase',
      page: 2,
      per_page: 15,
      term: 'Trade',
    })
  })
})
