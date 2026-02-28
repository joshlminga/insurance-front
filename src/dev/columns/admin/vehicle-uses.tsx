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
            return <div>{cover_for?.name}</div>;
        },
    },
     {
        accessorKey: "covering",
        header: () => <div>Covers</div>,
        cell: ({ row }) => {
            const covering: any = row.getValue("covering");
            return (
                <div className="gap-2 flex">
                    <Badge
                        className="rounded bg-gray-200 text-gray-800">
                        {covering?.length} Covering{covering.length !== 1 ? 's' : ''}
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
            return <div>{meta?.description}</div>;
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
];