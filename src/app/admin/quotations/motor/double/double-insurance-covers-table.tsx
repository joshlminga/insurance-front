/**
 * Client-side searchable / sortable table of DMVIC overlapping covers.
 *
 * Removable: if this is buggy or slow, delete this file and replace the
 * <DoubleInsuranceCoversTable /> usage on page.tsx with a plain list (or nothing).
 * The lookup helper and form do not depend on this component.
 */
import { DataTable, type Column } from '@/components/shared/data-table'
import type { DoubleInsuranceCover } from '@/utils/dmvic-double-insurance'
import { formatDoubleResultDate } from './format-double-result-date'

function showValue(value: string): string {
  return value.trim() === '' ? '-' : value
}

const COLUMNS: Column<DoubleInsuranceCover>[] = [
  {
    key: 'certificateNumber',
    label: 'Certificate no',
    sortable: true,
    render: (value) => showValue(String(value ?? '')),
  },
  {
    key: 'coverExpiryDate',
    label: 'Expiry date',
    sortable: true,
    render: (value) => formatDoubleResultDate(String(value ?? '')),
  },
  {
    key: 'insuranceName',
    label: 'Insurer',
    sortable: true,
    render: (value) => showValue(String(value ?? '')),
  },
  {
    key: 'chassisNumber',
    label: 'Chassis number',
    sortable: true,
    render: (value) => showValue(String(value ?? '')),
  },
]

type DoubleInsuranceCoversTableProps = {
  covers: DoubleInsuranceCover[]
}

export function DoubleInsuranceCoversTable({
  covers,
}: DoubleInsuranceCoversTableProps) {
  return (
    <DataTable
      data={covers}
      columns={COLUMNS}
      searchable
      searchPlaceholder="Search certificates…"
      searchKeys={[
        'certificateNumber',
        'coverExpiryDate',
        'insuranceName',
        'chassisNumber',
      ]}
      pageSize={10}
      emptyMessage="No matching covers."
    />
  )
}
