/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/table-core";

export const MyCoversColumns: ColumnDef<any>[] = [
    {
        accessorKey: "Cover",
        header: () => <div>Cover</div>,
        cell: ({ row }) => {
            const Cover: string = row.getValue("Cover");
            return <div>{Cover}</div>;
        },
    },
    {
        accessorKey: "Renewal",
        header: () => <div>Renewal Date</div>,
        cell: ({ row }) => {
            const Renewal: string = row.getValue("Renewal");
            return <div>{Renewal}</div>;
        },
    },
    {
        accessorKey: "value",
        header: () => <div>Insured Value Date</div>,
        cell: ({ row }) => {
            const value: string = row.getValue("value");
            return <div>{value}</div>;
        },
    },
    {
        accessorKey: "claims",
        header: () => <div>Claims</div>,
        cell: ({ row }) => {
            const claims: string = row.getValue("claims");
            return <div>{claims}</div>;
        },
    },
    // {
    //     accessorKey: "is_active",
    //     header: () => <div>Status</div>,
    //     cell: ({ row }) => {
    //         const isActive: boolean = row.getValue("is_active");
    //         return (
    //             <Badge
    //                 className={`rounded-lg font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    //                     }`}>
    //                 {isActive ? "Active" : "Inactive"}
    //             </Badge>
    //         );
    //     },
    // },
];