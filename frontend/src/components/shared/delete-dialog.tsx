"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface DeleteDialogProps<T> {
    item: T
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    title?: string
    description?: string
    entityName: string
    entityDisplayField: keyof T
    deleteFunction?: (id: string) => Promise<void>
}

export function DeleteDialog<T extends { id: string }>({
    item,
    open,
    onOpenChange,
    onSuccess,
    title = "Are you sure?",
    description,
    entityName,
    entityDisplayField,
    deleteFunction,
}: DeleteDialogProps<T>) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    const displayName = String(item[entityDisplayField])
    const defaultDescription = `This action cannot be undone. This will permanently delete the ${entityName.toLowerCase()} "${displayName}" and remove its data from the system.`

    const handleDelete = async () => {
        try {
            setIsDeleting(true)

            if (deleteFunction) {
                await deleteFunction(item.id)
            } else {
                // Mặc định log ra console nếu không có hàm xóa được cung cấp
                console.log(`Deleting ${entityName}:`, item.id)
            }

            toast({
                title: "Success",
                description: `${entityName} deleted successfully`,
            })

            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(`Error deleting ${entityName}:`, error)
            toast({
                title: "Error",
                description: `An error occurred while deleting the ${entityName.toLowerCase()}`,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

