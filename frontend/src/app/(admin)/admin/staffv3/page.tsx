"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { useToast } from "@/hooks/use-toast"
import { UserForm } from "./component/user-form"
import { columns } from "./component/column"
import { staffApi } from "@/services/api/staffApi"
import { useQuery } from "@tanstack/react-query"

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
                const response = await staffApi.getAll()
                const data = await response.data

                // Filter out users where isDeleted is true
                return data.filter(user => !user.isDeleted)
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

    const handleCreateNew = () => {
        setOpenUserForm(true)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading users...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground text-sm font-light">Manage your users and their permissions.</p>
            </div>
            <DataTable
                columns={columns}
                data={users}
                searchKey="name"
                searchKeyAlt="email"
                searchPlaceholder="Search by name or email..."
                filters={[
                    {
                        columnId: "roleName",
                        title: "Role",
                        options: [
                            { label: "Admin", value: "ADMIN" },
                            { label: "Staff", value: "STAFF" },
                            { label: "Approver", value: "APPROVER" },
                            { label: "Finance", value: "FINANCE" },
                        ],
                    },
                    {
                        columnId: "rank",
                        title: "Rank",
                        options: [
                            { label: "Intern", value: "Intern" },
                            { label: "Fresher", value: "Fresher" },
                            { label: "Junior", value: "Junior" },
                            { label: "Senior", value: "Senior" },
                        ],
                    },
                    {
                        columnId: "department",
                        title: "Department",
                        options: [
                            { label: "Software Development", value: "SoftwareDevelopment" },
                            { label: "Quality Assurance", value: "QualityAssurance" },
                            { label: "Project Management", value: "ProjectManagement" },
                            { label: "Business Analysis", value: "BusinessAnalysis" },
                            { label: "Scrum Master", value: "ScrumMaster" },
                            { label: "UI/UX Design", value: "UIUXDesign" },
                            { label: "Human Resources", value: "HumanResources" },
                            { label: "Finance", value: "Finance" },
                            { label: "Tech Lead", value: "TechLead" },
                            { label: "Software Architect", value: "SoftwareArchitect" },
                            { label: "Customer Support", value: "CustomerSupport" },
                            { label: "Data Science", value: "DataScience" },
                            { label: "Sales", value: "Sales" },
                            { label: "Marketing", value: "Marketing" },
                            { label: "IT Support", value: "ITSupport" },
                        ],
                    },
                ]}
                onCreateNew={handleCreateNew}
                createNewLabel="Add User"
            />
            <UserForm
                open={openUserForm}
                onOpenChange={setOpenUserForm}
                mode="create"
            />
        </div>
    )
}

