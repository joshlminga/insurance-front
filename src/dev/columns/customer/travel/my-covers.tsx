/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { COVER_STATUS_DISPLAY } from "@/utils/constatnts";
import { formatCurrency } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

/** Columns for the Travel tab on customer My Covers (rows from reports/travel/user/covers). */
export const TravelCoversColumns: ColumnDef<any>[] = [
    {
        accessorKey: "quotation_code",
        header: () => <div>Quote Ref</div>,
        cell: ({ row }) => <div>{row.getValue("quotation_code") ?? "-"}</div>,
    },
    {
        id: "destination",
        header: () => <div>Destination</div>,
        cell: ({ row }) => <div>{row.original?.trip?.destination?.name ?? "-"}</div>,
    },
    {
        id: "insurer",
        header: () => <div>Insurer</div>,
        cell: ({ row }) => <div>{row.original?.provider?.name ?? "-"}</div>,
    },
    {
        id: "departure_date",
        header: () => <div>Departure</div>,
        cell: ({ row }) => <div>{row.original?.trip?.departure_date ?? "-"}</div>,
    },
    {
        id: "return_date",
        header: () => <div>Return</div>,
        cell: ({ row }) => <div>{row.original?.trip?.return_date ?? "-"}</div>,
    },
    {
        accessorKey: "installment_amount",
        header: () => <div>Premium</div>,
        cell: ({ row }) => (
            <div>{formatCurrency(row.getValue("installment_amount"))}</div>
        ),
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
