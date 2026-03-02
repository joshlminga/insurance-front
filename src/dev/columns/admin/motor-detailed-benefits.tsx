/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const MotorDetailedBenefitsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "group",
        header: () => <div>Group</div>,
        cell: ({ row }) => {
            const group: string = row.getValue("group");
            return <div>{group}</div>;
        },
    },
    {
        accessorKey: "reference",
        header: () => <div>Reference</div>,
        cell: ({ row }) => {
            const reference: string = row.getValue("reference");
            return <div>{reference}</div>;
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