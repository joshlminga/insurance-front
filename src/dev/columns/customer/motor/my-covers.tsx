/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { COVER_STATUS_DISPLAY } from "@/utils/constatnts";
import { formatCurrency } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";


export const MyCoversColumns: ColumnDef<any>[] = [
     {
        accessorKey: "cover_type",
        header: () => <div>Class</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
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
        accessorKey: "certificate",
        header: () => <div>Issue Date</div>,
        cell: ({ row }) => {
            const certificate: any = row.getValue("certificate");
            return <div>{certificate?.issued_date}</div>;
        },
    },
    {
        accessorKey: "certificate",
        header: () => <div>Expiry Date</div>,
        cell: ({ row }) => {
            const certificate: any = row.getValue("certificate");
            return <div>{certificate?.expiry_date}</div>;
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