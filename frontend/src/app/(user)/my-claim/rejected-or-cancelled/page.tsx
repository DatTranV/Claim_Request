"use client"

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useToast } from "@/hooks/use-toast";
import { createColumns, Claim } from "../components/column";
import { claimApi } from "@/services/api/claimApi";
import { Table } from "@tanstack/react-table";
import { ViewClaimDialog } from "../components/view-claim-dialog";
import { EditClaimDialog } from "../components/edit-claim-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DraftClaimsPage() {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Claim[]>({
    queryKey: ["my-claims", "draft"],
    queryFn: async () => {
      try {
        const response = await claimApi.myClaim("rejected%26cancelled");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching claims:", error);
        toast({
          title: "Error",
          description: "Failed to fetch claims",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const claims = data || [];

  const handleSelectionChange = (table: Table<Claim>) => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    setSelectedUserIds(selectedIds);
  };

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setDetailDialogOpen(true);
  };

  const handleEdit = (claim: Claim) => {
    setSelectedClaim(claim);
    setEditDialogOpen(true);
  };

  const handleSubmit = (claim: Claim) => {
    setSelectedClaim(claim);
    setSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedClaim) return;

    try {
      const response = await claimApi.submit(selectedClaim.id);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Claim submitted for approval successfully",
        });

        queryClient.invalidateQueries({ queryKey: ["my-claims", "draft"] });
        setSubmitDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit claim for approval",
        variant: "destructive",
      });
    }
  };

  const columns = createColumns(handleViewDetail, handleEdit, handleSubmit);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading claims...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Rejected Or Cancelled Claims</h1>
        <p className="text-muted-foreground">Manage your claims and their permissions.</p>
      </div>
      <DataTable
        columns={columns}
        data={claims}
        searchKey="staffName"
        searchKeyAlt="projectName"
        searchPlaceholder="Search by staff name or project name..."
        onSelectionChange={handleSelectionChange}
      />

      {/* Claim Dialogs */}
      <ViewClaimDialog
        claim={selectedClaim}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <EditClaimDialog
        claim={selectedClaim}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["my-claims", "draft"] });
        }}
      />

      {/* Confirm Submit Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this claim for approval? Once submitted, you will not be able to edit it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

