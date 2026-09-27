import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { travelLocalIsoDate } from '@/types/form-schema'
import {
  caretAfterMask,
  ddMmYyyyToIso,
  isoToDdMmYyyy,
  maskDdMmYyyy,
} from '@/utils/dd-mm-yyyy'
import React, { useEffect, useRef, useState } from 'react'

type DdMmYyyyDateInputProps = {
  value?: string
  onChange?: (isoOrEmpty: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  /** Max allowed ISO date (inclusive). Defaults to today. */
  maxIso?: string
  placeholder?: string
  invalid?: boolean
}

/**
 * Typed DD/MM/YYYY date field.
 * Externally stores ISO YYYY-MM-DD (or '' while incomplete/invalid).
 */
export function DdMmYyyyDateInput({
  value = '',
  onChange,
  label,
  required = false,
  disabled = false,
  className,
  id,
  maxIso = travelLocalIsoDate(),
  placeholder = 'DD/MM/YYYY',
  invalid = false,
}: DdMmYyyyDateInputProps) {
  const [display, setDisplay] = useState(() => isoToDdMmYyyy(value))
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingCaret = useRef<number | null>(null)

  useEffect(() => {
    const fromValue = isoToDdMmYyyy(value)
    if (value && fromValue) {
      setDisplay(fromValue)
    }
    if (!value) {
      const complete = ddMmYyyyToIso(display)
      if (complete) {
        setDisplay('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follow parent value only
  }, [value])

  useEffect(() => {
    if (pendingCaret.current === null || !inputRef.current) {
      return
    }
    const pos = pendingCaret.current
    pendingCaret.current = null
    inputRef.current.setSelectionRange(pos, pos)
  }, [display])

  const commit = (nextDisplay: string) => {
    setDisplay(nextDisplay)
    const iso = ddMmYyyyToIso(nextDisplay)
    if (!iso) {
      onChange?.('')
      return
    }
    if (maxIso && iso > maxIso) {
      onChange?.('')
      return
    }
    onChange?.(iso)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </Label>
      ) : null}
      <Input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={invalid}
        value={display}
        className={cn(
          'h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]',
          invalid && 'border-red-500 focus-visible:ring-red-500'
        )}
        onChange={(event) => {
          const el = event.target
          let nextRaw = el.value
          const caret = el.selectionStart ?? nextRaw.length
          const deleting = nextRaw.length < display.length

          // Backspace on a trailing slash: also drop the digit before it
          // so the user is not stuck on "07/" ↔ "07" loops.
          if (
            deleting &&
            display.endsWith('/') &&
            nextRaw === display.slice(0, -1)
          ) {
            nextRaw = nextRaw.replace(/\D/g, '').slice(0, -1)
          }

          const masked = maskDdMmYyyy(nextRaw, { deleting })
          pendingCaret.current = caretAfterMask(nextRaw, caret, masked)
          commit(masked)
        }}
        onBlur={() => {
          commit(maskDdMmYyyy(display))
        }}
      />
    </div>
  )
}
