/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const MotorRateColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "vehicle_use",
        header: () => <div>Vehicle Use</div>,
        cell: ({ row }) => {
            const vehicle_use: any = row.getValue("vehicle_use");
            return <div>{vehicle_use?.name}</div>;
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
                    className={`rounded-lg text-white font-semibold ${isActive ? "bg-green-400" : "bg-red-500"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
];