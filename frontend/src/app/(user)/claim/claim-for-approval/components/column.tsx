"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        enableHiding: false,
        maxSize: 100,
        cell: ({ row }) => {
            const id = row.getValue("id") as string
            return <div className="truncate max-w-[100px]" title={id}>{id}</div>
        }
    },
    {
        accessorKey: "staffName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Staff Name" />,
    },
    {
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
    },
    {
        accessorKey: "projectDuration",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project Duration" />,
    },
    {
        accessorKey: "totalWorkingHours",
        header: ({ column }) => <DataTableColumnHeader column={column} title="TotalWorkingHours" />,
    },
    {
        accessorKey: "totalClaimAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="TotalClaimAmount" />,
    },

]

