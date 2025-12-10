"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Claim } from "./column"
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
import { claimApi } from "@/services/api/claimApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface ClaimDetailProps {
  claim: Claim | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showActions?: boolean
}

export function ClaimDetail({
  claim,
  open,
  onOpenChange,
  showActions = false
}: ClaimDetailProps) {
  const { toast } = useToast()
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const queryClient = useQueryClient()

  const cancelMutation = useMutation({
    mutationFn: async (claimData: { id: string}) => {
      return claimApi.cancelClaim(claimData.id)
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: response.message,
        })
        // Invalidate and refetch claims data
        queryClient.invalidateQueries({ queryKey: ['my-claims'] })
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: response.message,
        })
      }
      setShowRejectConfirm(false)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel claim";
      toast({
        title: "Error",
        description: errorMessage,
      })
      setShowRejectConfirm(false)
    }
  })

  const confirmReject = () => {
 
    setShowRejectConfirm(true)
  }


  const handleCancel = () => {
    if (!claim) return;
    cancelMutation.mutate({ id: claim.id })
  }

  if (!claim) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Staff Name</Label>
              <Input
                value={claim.staffName}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Project Name</Label>
              <Input
                value={claim.projectName}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Project Duration</Label>
              <Input
                value={claim.projectDuration}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Total Working Hours</Label>
              <Input
                value={claim.totalWorkingHours.toString()}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
            >
              Close
            </Button>
            {showActions && (
              <>
                <Button 
                  onClick={confirmReject} 
                  variant="outline" 
                  disabled={cancelMutation.isPending}
                  className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showActions && (
        <>
          <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Claim</AlertDialogTitle>
                <AlertDialogDescription>
                This action will cancel the claim.
  <br />
  Please click ‘OK’ to cancel the claim or ‘Cancel’ to close the dialog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={cancelMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancel} 
                  disabled={cancelMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {cancelMutation.isPending ? "Canceling..." : "OK"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )
} 