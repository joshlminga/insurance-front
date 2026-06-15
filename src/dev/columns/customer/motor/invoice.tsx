/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { COVER_STATUS_DISPLAY } from "@/utils/constatnts";
import { formatCurrency } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

export const MyInvoiceColumns: ColumnDef<any>[] = [
    {
        accessorKey: "invoice_number",
        header: () => <div>Invoice #</div>,
        cell: ({ row }) => {
            const invoice_number: string = row.getValue("invoice_number");
            return <div>{invoice_number}</div>;
        },
    },
    {
        accessorKey: "installment_text",
        header: () => <div>Installment</div>,
        cell: ({ row }) => {
            const invoice = row.original;
            return (<div> {invoice?.installment_text} ({invoice?.installment_number} of {invoice?.total_installments})</div>);
        },
    },
    {
        accessorKey: "installment_amount",
        header: () => <div>Amount</div>,
        cell: ({ row }) => {
            const installment_amount: string = row.getValue("installment_amount");
            return <div>{formatCurrency(installment_amount)}</div>;
        },
    },
    {
        accessorKey: "payment_status",
        header: () => <div>Payment</div>,
        cell: ({ row }) => {
            const payment_status: string = row.getValue("payment_status");
            return <div>{payment_status}</div>;
        },
    },
    {
        accessorKey: "is_overdue",
        header: () => <div>Overdue</div>,
        cell: ({ row }) => {
            const is_overdue: string = row.getValue("is_overdue");
            return <div>
                <Badge
                    variant="outline"
                    className={
                        is_overdue
                            ? 'border-red-200 bg-red-50 text-red-800'
                            : 'border-green-200 bg-green-50 text-green-800'
                    }>
                    {is_overdue
                        ? 'Yes'
                        : 'No'}
                </Badge>
            </div>;
        },
    },
    {
        accessorKey: "cover_status",
        header: () => <div>Cover Status</div>,
        cell: ({ row }) => {
            const status: string = row.getValue("cover_status");
            const display =
                COVER_STATUS_DISPLAY[status] ?? COVER_STATUS_DISPLAY.failed;
            return (
                <Badge
                    variant="outline"
                    className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${display.className}`}>
                    {display.label}
                </Badge>
            );
        },
    },
];