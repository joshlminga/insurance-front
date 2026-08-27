import { describe, expect, it } from 'vitest'
import { MotorKycSchema } from '@/types/form-schema'
import { MAX_KYC_FILE_BYTES } from '@/utils/constatnts'

/** Build a fake File with a given reported size (bytes) for schema tests. */
function makeFile(name: string, size: number, type = 'application/pdf'): File {
  const file = new File(['x'], name, { type })
  // Override size so we do not allocate a real 10MB buffer in tests
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('MotorKycSchema KRA PIN', () => {
  it('accepts valid KRA PINs', () => {
    for (const tax_pin of ['A020828302W', 'P051109164C', 'a020828302w']) {
      const result = MotorKycSchema.safeParse({ tax_pin })
      expect(result.success, `expected ${tax_pin} to pass`).toBe(true)
    }
  })

  it('rejects missing or invalid KRA PINs', () => {
    for (const tax_pin of ['', 'A020828302', 'A020828302WW', '1020828302W', 'A02082830WW']) {
      const result = MotorKycSchema.safeParse({ tax_pin })
      expect(result.success, `expected ${tax_pin} to fail`).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('tax_pin'))).toBe(true)
      }
    }
  })
})

describe('MotorKycSchema KYC file size', () => {
  it('accepts a PDF at or under 10MB', () => {
    const result = MotorKycSchema.safeParse({
      tax_pin: 'A020828302W',
      logbook: makeFile('logbook.pdf', MAX_KYC_FILE_BYTES),
    })
    expect(result.success).toBe(true)
  })

  it('rejects a PDF over 10MB', () => {
    const result = MotorKycSchema.safeParse({
      tax_pin: 'A020828302W',
      logbook: makeFile('logbook.pdf', MAX_KYC_FILE_BYTES + 1),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const logbookIssue = result.error.issues.find((issue) => issue.path.includes('logbook'))
      expect(logbookIssue?.message).toBe('Each file must be 10MB or smaller.')
    }
  })
})
