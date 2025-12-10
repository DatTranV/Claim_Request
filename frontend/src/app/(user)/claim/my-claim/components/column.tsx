"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import type { User } from "../api/users/route"
import { useState } from "react"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { formatDollarCurrency } from "@/lib/utils"

const deleteUser = async (id: string): Promise<void> => {
    // await userApi.delete(`/users/${id}`)
    console.log("Deleting user:", id)
}


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
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            const [showViewDialog, setShowViewDialog] = useState(false)
            const [showEditDialog, setShowEditDialog] = useState(false)
            const [showDeleteDialog, setShowDeleteDialog] = useState(false)

            return (
                <>
                    <DataTableRowActions
                        row={row}
                        actions={[
                            {
                                label: "View Details",
                                onClick: () => setShowViewDialog(true),
                            },
                            {
                                label: "Edit",
                                onClick: () => setShowEditDialog(true),
                            },
                            // {
                            //     label: "Delete",
                            //     onClick: () => setShowDeleteDialog(true),
                            //     destructive: true,
                            // },
                        ]}
                    />
                </>
            )
        },
    },
]

