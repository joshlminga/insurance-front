/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const ParametersColumns: ColumnDef<any>[] = [
    {
        accessorKey: "organization_name",
        header: () => <div>Organization Name</div>,
        cell: ({ row }) => {
            const organization_name: any = row.getValue("organization_name");
            return <div>{organization_name}</div>;
        },
    },
    {
        accessorKey: "product",
        header: () => <div>Product Name</div>,
        cell: ({ row }) => {
            const product: any = row.getValue("product");
            return <div>{product}</div>;
        },
    },
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
     {
        accessorKey: "code",
        header: () => <div>Parameter Code</div>,
        cell: ({ row }) => {
            const code: any = row.getValue("code");
            return <div>{code}</div>;
        },
    },
    {
        accessorKey: "value_mode",
        header: () => <div>Value Mode</div>,
        cell: ({ row }) => {
            const value_mode: any = row.getValue("value_mode");
            return <div>{value_mode}</div>;
        },
    },
    {
        accessorKey: "value",
        header: () => <div>Value</div>,
        cell: ({ row }) => {
            const valueMode = row.original.value_mode;
            const percentage = row.original.percentage;
            const amount = row.original.amount;

            if (valueMode === "percentage") {
                return (
                    <div>
                        {percentage !== null && percentage !== undefined
                            ? `${Number(percentage)}%`
                            : "-"}
                    </div>
                );
            }

            if (valueMode === "amount") {
                return (
                    <div>
                        {amount !== null && amount !== undefined
                            ? Number(amount).toLocaleString()
                            : "-"}
                    </div>
                );
            }

            return <div>-</div>;
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