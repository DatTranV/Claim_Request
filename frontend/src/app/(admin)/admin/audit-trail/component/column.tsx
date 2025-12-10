"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { User } from "@/services/api/userApi"


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
        accessorKey: "fullName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
    },
    {
        accessorKey: "userAction",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    },
    {
        accessorKey: "loggedNote",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />,
    },
    {
        accessorKey: "actionDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue("actionDate") as string)
            return <div>{date.toLocaleString()}</div>
        },
    },
    {
        accessorKey: "claimId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="claimId" />,
    },
]

