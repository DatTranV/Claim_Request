"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./component/column"
import { useToast } from "@/hooks/use-toast"
import { ProjectForm } from "./component/project-form"
import { projectApi, Project } from "@/services/api/projectApi"
import { useQuery } from "@tanstack/react-query"

// Define a query key for project data
export const PROJECT_QUERY_KEY = ["projects"]

export default function ProjectsPage() {
    const [openProjectForm, setOpenProjectForm] = useState(false)
    const { toast } = useToast()

    // Use React Query for data fetching
    const { data: projects = [], isLoading } = useQuery({
        queryKey: PROJECT_QUERY_KEY,
        queryFn: async () => {
            try {
                const response = await projectApi.getAll()
                const data = response.data.filter(project => !project.isDeleted)
                return data
            } catch (error) {
                // Log the error to the console for debugging purposes
                console.error("Fetch projects error:", error)
                toast({
                    title: "Error",
                    description: "Failed to fetch projects",
                    variant: "destructive",
                })
                return []
            }
        }
    })

    const handleCreateNewProject = () => {
        setOpenProjectForm(true)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading projects...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground text-sm font-light">Manage your projects and their statuses.</p>
            </div>
            <DataTable
                columns={columns}
                data={projects}
                searchKey="projectName"
                searchKeyAlt="projectCode"
                searchPlaceholder="Search by project name or project code..."
                // filters={[
                //     {
                //         columnId: "status",
                //         title: "Status",
                //         options: [
                //             { label: "Active", value: "active" },
                //             { label: "Completed", value: "completed" },
                //             { label: "Archived", value: "archived" },
                //             { label: "Draft", value: "draft" },
                //         ],
                //     },
                onCreateNew={handleCreateNewProject}
                createNewLabel="Create Project"
            />

            <ProjectForm open={openProjectForm} onOpenChange={setOpenProjectForm} mode="create" />
        </div>
    )
}

