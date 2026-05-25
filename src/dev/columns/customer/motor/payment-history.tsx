/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

export const MyPaymentHistory: ColumnDef<any>[] = [
    {
        accessorKey: "cover_type",
        header: () => <div>Cover Type</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
     {
        accessorKey: "agency",
        header: () => <div>Agency</div>,
        cell: ({ row }) => {
            const agency: any = row.getValue("agency");
            return <div>{agency?.name}</div>;
        },
    },
    {
        accessorKey: "due_date",
        header: () => <div>Renewal Date</div>,
        cell: ({ row }) => {
            const due_date: string = row.getValue("due_date");
            return <div>{due_date}</div>;
        },
    },
    {
        accessorKey: "installment_amount",
        header: () => <div>Insured Value</div>,
        cell: ({ row }) => {
            const installment_amount: string = row.getValue("installment_amount");
            return <div>{formatCurrency(installment_amount)}</div>;
        },
    },
    {
        accessorKey: "status",
        header: () => <div>Payment</div>,
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            return (
                <Badge
                    className={`rounded-lg font-semibold ${status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                    {status ? "Paid" : "Not Paid"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const isActive: boolean = row.getValue("is_active");
            return (
                <Badge
                    className={`rounded-lg font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
];