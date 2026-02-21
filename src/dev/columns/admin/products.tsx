/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const MotorProductsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "officename",
        header: () => <div>Office Name</div>,
        cell: ({ row }) => {
            const type: string = row.getValue("officename");
            return <div>{type}</div>;
        },
    },
     {
        accessorKey: "access",
        header: () => <div>Access</div>,
        cell: ({ row }) => {
            const type: string = row.getValue("access");
            return <div>{type}</div>;
        },
    },
    {
        accessorKey: "targets",
        header: () => <div>Targeted Organizations</div>,
        cell: ({ row }) => {
            const targets: any[] = row.getValue("targets") || [];
            return (
                <div className="gap-2 flex">
                    <Badge
                        className="rounded bg-gray-200 text-gray-800">
                        {targets.length} Targeted Organization{targets.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "for_public",
        header: () => <div>Target</div>,
        cell: ({ row }) => {
            const isPublic: boolean = row.getValue("for_public");
            return (
                <Badge
                    className={`rounded-lg text-white font-semibold ${isPublic ? "bg-gray-400" : "bg-cyan-500"
                        }`}>
                    {isPublic ? "Public" : "Private"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "start_date",
        header: () => <div>Start At</div>,
        cell: ({ row }) => {
            const start_date: string = row.getValue("start_date");
            return (
                <div>
                    {new Date(start_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: "expiry_date",
        header: () => <div>Expiry At</div>,
        cell: ({ row }) => {
            const expiry_date: string = row.getValue("expiry_date");
            return (
                <div>
                    {new Date(expiry_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
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
                    className={`rounded-lg text-white font-semibold ${isActive ? "bg-green-400" : "bg-red-500"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div>Created At</div>,
        cell: ({ row }) => {
            const created_at: string = row.getValue("created_at");
            return (
                <div>
                    {new Date(created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            );
        },
    },
];