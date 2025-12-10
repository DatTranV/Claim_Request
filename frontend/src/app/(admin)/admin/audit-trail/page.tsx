"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { useToast } from "@/hooks/use-toast"
import { columns } from "./component/column"
import { useQuery } from "@tanstack/react-query"
import { UserForm } from "../staffv3/component/user-form"
import { auditTrailApi } from "@/services/api/audittrailApi"
import React from "react"

// Define a query key for staff data
export const STAFF_QUERY_KEY = ["staff"]

export default function UsersPage() {
    const [openUserForm, setOpenUserForm] = useState(false)
    const { toast } = useToast()

    // Use React Query for data fetching
    const { data: users = [], isLoading } = useQuery({
        queryKey: STAFF_QUERY_KEY,
        queryFn: async () => {
            try {
                const response = await auditTrailApi.getAll()
                if (!response.isSuccess) {
                    throw new Error(response.message)
                }
                const data = response.data || []
                return data
            } catch (error: Error | unknown) {
                const errorMessage = error instanceof Error ? error.message : "Failed to fetch users"
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
                return []
            }
        }
    })

    const safeData = React.useMemo(() => Array.isArray(users) ? users : [], [users])

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading audit...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Audit Trails</h1>
                <p className="text-muted-foreground text-sm font-light">Manage your logs and history.</p>
            </div>
            <DataTable
                columns={columns}
                data={safeData}
                searchKey="fullName"

                searchPlaceholder="Search by name"
                filters={[
                    {
                        columnId: "userAction",
                        title: "User Action",
                        options: [
                            { label: "Create", value: "Create" },
                            { label: "Update", value: "Update" },
                            { label: "Submit", value: "Submit" },
                            { label: "Approve", value: "Approve" },
                            { label: "Return", value: "Return" },
                            { label: "Reject", value: "Reject" },
                            { label: "Paid", value: "Paid" },
                            { label: "Cancel", value: "Cancel" },
                            { label: "Download", value: "Download" },
                        ],
                    },

                ]}

            />
            <UserForm
                open={openUserForm}
                onOpenChange={setOpenUserForm}
                mode="create"
            />
        </div>
    )
}

