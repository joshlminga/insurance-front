/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";
import { CopyCell } from "../..";
import { formatDate } from "@/lib/format";

export const MyPaymentHistory: ColumnDef<any>[] = [
    {
        accessorKey: "receipt_number",
        header: () => <div>Receipt No.</div>,
        cell: ({ row }) => {
            const receipt_number: string = row.getValue("receipt_number");
            return <CopyCell value={receipt_number} />;
        },
    },
     {
        accessorKey: "agency",
        header: () => <div>Paid To</div>,
        cell: ({ row }) => {
            const agency: any = row.getValue("agency");
            return <div>{agency?.name}</div>;
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div>Payment Date</div>,
        cell: ({ row }) => {
            const created_at: string = row.getValue("created_at");
            return <div>{formatDate(created_at)}</div>;
        },
    },
    {
        accessorKey: "amount",
        header: () => <div>Amount</div>,
        cell: ({ row }) => {
            const amount: string = row.getValue("amount");
            return <div>{formatCurrency(amount)}</div>;
        },
    },
    {
        accessorKey: "invoice_status",
        header: () => <div>Payment</div>,
        cell: ({ row }) => {
            const invoice_status: string = row.getValue("invoice_status");
            return (
                <Badge
                    className={`rounded-lg font-semibold ${invoice_status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                    {invoice_status ? "Paid" : "Not Paid"}
                </Badge>
            );
        },
    },
];