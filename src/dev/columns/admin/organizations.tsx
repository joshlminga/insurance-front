/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const OrganizationsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "organization_name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("organization_name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "organization_type",
        header: () => <div>Type</div>,
        cell: ({ row }) => {
            const type: string = row.getValue("organization_type");
            return <div>{type}</div>;
        },
    },
    {
        accessorKey: "domain",
        header: () => <div>Domain</div>,
        cell: ({ row }) => {
            const domain: string = row.getValue("domain");
            return <div>{domain}</div>;
        },
    },
    {
        accessorKey: "is_active",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const isActive: boolean = row.getValue("is_active");
            return (
                <Badge
                    className={`rounded-full text-white font-semibold ${isActive ? "bg-green-500" : "bg-red-500"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "organization_location",
        header: () => <div>Locations</div>,
        cell: ({ row }) => {
            const locations: any[] = row.getValue("organization_location") || [];
            return (
                <div className="gap-2 flex">
                    <Badge
                        className="rounded bg-gray-200 text-gray-800">
                        {locations.length} Location{locations.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            );
        },
    },
];