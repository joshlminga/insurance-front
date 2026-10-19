/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/table-core";
import { formatClaimDisplayDate } from "@/utils/claims";

/**
 * Columns for the customer "My Claims" table.
 * Each `accessorKey` is a key on the row returned by GET claims/me
 * (think of it like `$claim->claim_number` in a Blade table).
 */
export const MyClaimsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "claim_number",
        header: () => <div>Claim No.</div>,
        cell: ({ row }) => <div className="font-medium">{row.getValue("claim_number")}</div>,
    },
    {
        accessorKey: "registration_number",
        header: () => <div>Vehicle</div>,
        cell: ({ row }) => <div>{row.getValue("registration_number") ?? "—"}</div>,
    },
    {
        accessorKey: "claim_type",
        header: () => <div>Claim Type</div>,
        cell: ({ row }) => <div>{row.getValue("claim_type") ?? "—"}</div>,
    },
    {
        accessorKey: "loss_date",
        header: () => <div>Date of Loss</div>,
        cell: ({ row }) => <div>{formatClaimDisplayDate(row.getValue("loss_date"))}</div>,
    },
    {
        accessorKey: "reported_date",
        header: () => <div>Reported</div>,
        cell: ({ row }) => <div>{formatClaimDisplayDate(row.getValue("reported_date"))}</div>,
    },
    {
        accessorKey: "documents_shared",
        header: () => <div>Documents Shared</div>,
        cell: ({ row }) => (
            <div>
                {row.original.documents_shared ?? 0} / {row.original.documents_total ?? 0}
            </div>
        ),
    },
    {
        accessorKey: "customer_status_label",
        header: () => <div>Claim Status</div>,
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("customer_status_label") ?? "—"}</div>
        ),
    },
];
