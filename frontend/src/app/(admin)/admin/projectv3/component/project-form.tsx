"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar } from "lucide-react"
import { EnrollUserForm } from "./enroll-user-form"
import { projectApi, Project } from "@/services/api/projectApi"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useQueryClient } from "@tanstack/react-query"
import { PROJECT_QUERY_KEY } from "../page"

// interface Project {
//     id?: string
//     projectName: string
//     projectCode: string
//     description: string
//     status: string
//     budget: number
//     startDate: string
//     endDate: string
//     createdAt: string
//     updatedAt?: string
// }

interface ProjectFormProps {
    project?: Project
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "create" | "edit" | "view" | "Enroll User"
}

export function ProjectForm({ project, open, onOpenChange, mode }: ProjectFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<Partial<Project>>(
        project || {
            id: "",
            projectName: "",
            projectCode: "",
            status: "New",
            budget: 0,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        },
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const isViewMode = mode === "view"
    const isEnrollMode = mode === "Enroll User"
    const title = mode === "create" ? "Add New Project" : mode === "edit" ? "Edit Project" : "Project Details"

    const resetForm = () => {
        setFormData({
            id: "",
            projectName: "",
            projectCode: "",
            status: "New",
            budget: 0,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
    };

    const handleChange = (field: keyof Project, value: string | number | Date) => {
        if (!isViewMode) {
            setFormData((prev) => ({ ...prev, [field]: value }))
        }
    }

    const handleSubmit = async () => {
        if (isViewMode) {
            onOpenChange(false)
            return
        }

        try {
            setIsSubmitting(true)

            if (mode === "create") {
                const response = await projectApi.create(formData as Omit<Project, "id" | "isDeleted">)
                console.log("Creating project:", formData)
                console.log("Response:", response)
                if (response.isSuccess) {
                    toast({
                        title: "Success",
                        description: "Project created successfully",
                    });
                    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY })
                    resetForm();
                    onOpenChange(false)
                }
                else if (!response.isSuccess) {
                    toast({
                        title: "Error",
                        description: response.message,
                        variant: "destructive",                   
                    })
                }
            } else if (mode === "edit" && project?.id) {
                const response = await projectApi.update(project.id, formData as Omit<Project, "isDeleted">)
                console.log("Updating project:", response)
                if (response.isSuccess) {
                    toast({
                        title: "Success",
                        description: "Project updated successfully",
                    });
                    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY })
                    onOpenChange(false)
                } else {
                    toast({
                        title: "Error",
                        description: response.message || "Failed to update project",
                        variant: "destructive",
                      
                    });
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",

            })
        } finally {
            setIsSubmitting(false)
            setShowConfirmDialog(false)
        }
    }

    return (
        <>
            {isEnrollMode ? (
                <EnrollUserForm
                    project={{
                        ...project!,
                        description: "",
                    }}
                    open={open}
                    onOpenChange={onOpenChange}
                />
            ) : (
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>
                                {isViewMode ? "View project details below." : "Fill in the information for the project."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectName" className="text-right">
                                    Project Name
                                </Label>
                                <Input
                                    id="projectName"
                                    value={formData.projectName || ""}
                                    onChange={(e) => handleChange("projectName", e.target.value)}
                                    className="col-span-3"
                                    disabled={isViewMode}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectCode" className="text-right">
                                    Project Code
                                </Label>
                                <div className="col-span-3 grid grid-cols-2 gap-3">
                                    <Input
                                        id="projectCode"
                                        value={formData.projectCode || ""}
                                        onChange={(e) => handleChange("projectCode", e.target.value)}
                                        disabled={isViewMode}
                                        className="w-40"
                                    />
                                    <div className="flex items-center gap-2 w-full">
                                        <Label htmlFor="status" className="text-right whitespace-nowrap">
                                            Status
                                        </Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleChange("status", value)}
                                            disabled={isViewMode}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="New" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                                <SelectItem value="New">New</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="budget" className="text-right">
                                    Budget
                                </Label>
                                <div className="col-span-3">
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 text-muted-foreground">$</span>
                                        <Input
                                            id="budget"
                                            type="number"
                                            min={1}
                                            value={formData.budget || ""}
                                            onChange={(e) => handleChange("budget", Number(e.target.value))}
                                            className="pl-7"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="startDate" className="text-right">
                                    Start Date
                                </Label>
                                <div className="col-span-3 relative w-full">
                                    <Calendar className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                                    <ReactDatePicker
                                        id="startDate"
                                        selected={formData.startDate ? new Date(formData.startDate) : null}
                                        onChange={(date) => handleChange("startDate", date?.toISOString() || new Date().toISOString())}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="w-full flex h-10 rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isViewMode}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="endDate" className="text-right">
                                    End Date
                                </Label>
                                <div className="col-span-3 relative w-full">
                                    <Calendar className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                                    <ReactDatePicker
                                        id="endDate"
                                        selected={formData.endDate ? new Date(formData.endDate) : null}
                                        onChange={(date) => handleChange("endDate", date?.toISOString() || new Date().toISOString())}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="w-full flex h-10 rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isViewMode}
                                        minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                            {project?.id && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="id" className="text-right">
                                        ID
                                    </Label>
                                    <Input id="id" value={project.id} className="col-span-3" disabled />
                                </div>
                            )}
    
                            {project?.createdAt && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="createdAt" className="text-right">
                                        Created At
                                    </Label>
                                    <Input
                                        id="createdAt"
                                        value={new Date(project.createdAt).toLocaleString()}
                                        className="col-span-3"
                                        disabled
                                    />
                                </div>
                            )}
                            {project?.modifiedAt && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="updatedAt" className="text-right">
                                        Updated At
                                    </Label>
                                    <Input
                                        id="updatedAt"
                                        value={new Date(project.modifiedAt).toLocaleString()}
                                        className="col-span-3"
                                        disabled
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            {isViewMode ? (
                                <Button onClick={() => onOpenChange(false)}>Close</Button>
                            ) : (
                                <>
                                    {mode === "create" && (
                                        <Button
                                            variant="outline"
                                            onClick={resetForm}
                                            type="button"
                                        >
                                            Refresh
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setShowConfirmDialog(true)} disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <ConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title="Are you sure?"
                description={
                    mode === "create"
                        ? "This will create a new project with the provided information."
                        : "This will update the project's information."
                }
                onConfirm={handleSubmit}
            />
        </>
    )
}

