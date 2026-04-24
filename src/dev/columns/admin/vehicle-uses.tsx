/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const VehicleUsesColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "cover_for",
        header: () => <div>Cover For</div>,
        cell: ({ row }) => {
            const cover_for: any = row.getValue("cover_for");
            const coverForLabel =
                cover_for?.name ?? (typeof cover_for === "string" ? cover_for : "-")
            return <div>{coverForLabel}</div>;
        },
    },
     {
        accessorKey: "covering",
        header: () => <div>Covers</div>,
        cell: ({ row }) => {
            const covering: any = row.getValue("covering");
            const coveringCount = Array.isArray(covering) ? covering.length : 0
            return (
                <div className="gap-2 flex">
                    <Badge
                        className="rounded bg-gray-200 text-gray-800">
                        {coveringCount} Covering{coveringCount !== 1 ? 's' : ''}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "meta",
        header: () => <div>Description</div>,
        cell: ({ row }) => {
            const meta: any = row.getValue("meta");
            const description =
                meta?.description ?? (typeof meta === "string" ? meta : "-")
            return <div>{description}</div>;
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
