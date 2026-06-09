/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/table-core";

export const MyClaimsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "cover_type",
        header: () => <div>Cover Type</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
    {
        accessorKey: "cover_type",
        header: () => <div>Agency Incident</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
    {
        accessorKey: "cover_type",
        header: () => <div>Claim Date</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
    {
        accessorKey: "cover_type",
        header: () => <div>Report Date</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
    {
        accessorKey: "cover_type",
        header: () => <div>Documents Shared</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    },
      {
        accessorKey: "cover_type",
        header: () => <div>Claim Status</div>,
        cell: ({ row }) => {
            const cover_type: string = row.getValue("cover_type");
            return <div>{cover_type}</div>;
        },
    }
];