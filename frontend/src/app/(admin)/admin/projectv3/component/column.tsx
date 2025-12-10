"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import type { Project } from "../api/projects/route"
import { ProjectForm } from "./project-form"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { formatDollarCurrency } from "@/lib/utils"
import { EnrollUserForm } from "./enroll-user-form"
import { ViewMemberForm } from "./view-member-form"
import { projectApi } from "@/services/api/projectApi"
import { useQueryClient } from "@tanstack/react-query"
import { PROJECT_QUERY_KEY } from "../page"


const deleteProject = async (id: string): Promise<void> => {
    await projectApi.delete(id)
    
    console.log("Deleting project:", id)
}


export const columns: ColumnDef<Project>[] = [
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
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: "projectCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    },
    {
        accessorKey: "budget",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
        cell: ({ row }) => {
            const budget = row.getValue("budget") as number
            return <div>{formatDollarCurrency(budget)}</div>
        },

    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = (row.getValue("status") as string) || "new"
            const displayStatus = status.charAt(0).toUpperCase() + status.slice(1)
            return (
                <Badge variant="default">
                    {displayStatus}
                </Badge>
            )
        },
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue("startDate") as string)
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue("endDate") as string)
            return <div>{date.toLocaleDateString()}</div>
        },
    },

    {
        id: "actions",
        cell: ({ row }) => {
            const queryClient = useQueryClient()
            const project = row.original
            const [showViewDialog, setShowViewDialog] = useState(false)
            const [showEditDialog, setShowEditDialog] = useState(false)
            const [showDeleteDialog, setShowDeleteDialog] = useState(false)
            const [showEnrollUserDialog, setShowEnrollUserDialog] = useState(false)
            const [showViewMemberDialog, setShowViewMemberDialog] = useState(false)

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
                                label: "View Members",
                                onClick: () => setShowViewMemberDialog(true),
                            },
                            {
                                label: "Enroll User",
                                onClick: () => setShowEnrollUserDialog(true),
                            },
                            {
                                label: "Edit",
                                onClick: () => setShowEditDialog(true),
                            },
                            {
                                label: "Delete",
                                onClick: () => setShowDeleteDialog(true),
                                destructive: true,
                            },
                        ]}
                    />

                    <ProjectForm project={project} open={showViewDialog} onOpenChange={setShowViewDialog} mode="view" />

                    <ProjectForm
                        project={project}
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                        mode="edit"
                    />

                    <EnrollUserForm
                        project={project}
                        open={showEnrollUserDialog}
                        onOpenChange={setShowEnrollUserDialog}
                    />

                    <ViewMemberForm
                        project={project}
                        open={showViewMemberDialog}
                        onOpenChange={setShowViewMemberDialog}
                    />

                    <DeleteDialog
                        item={project}
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        entityName="Project"
                        entityDisplayField="name"
                        deleteFunction={async () => {
                            await deleteProject(project.id)
                            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY })
                        }}
                    />
                </>
            )
        },
    },
]

