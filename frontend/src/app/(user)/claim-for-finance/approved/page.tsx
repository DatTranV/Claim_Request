"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useToast } from "@/hooks/use-toast";
import {
  createColumns,
  Claim,
} from "../../claim-for-approval/components/column";
import { claimApi } from "@/services/api/claimApi";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { ClaimDetail } from "../../claim-for-approval/components/claim-detail";

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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function UsersPage() {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data, isLoading } = useQuery<Claim[]>({
    queryKey: ["finance-claims"],
    queryFn: async () => {
      try {
        const response = await claimApi.claimForApproval("approved");
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

  // Use React Query to approve claims
  const paidMutation = useMutation({
    mutationFn: async (claimIds: string[]) => {
      const response = await claimApi.paid(claimIds);
      console.log("response", response);
      if(response.isSuccess){
        toast({
          title: "Success",
          description: response.message,         
        });
      }
      else{
        toast({
          title: "Error",
          description: response.message, 
          variant: "destructive",      
        });
        return;
      }
    },
    onSuccess: () => {
    

      // Invalidate and refetch claims
      queryClient.invalidateQueries({ queryKey: ["finance-claims"] });
      setShowPaidConfirm(false);
    },
    onError: (error: unknown) => {
      console.error("Error approving claims:", error);
      toast({
        title: "Error",
        description: "Failed to approve claims",
        variant: "destructive",
      });
      setShowPaidConfirm(false);
    },
  });

  const claim = data || [];

  const handleSelectionChange = (table: Table<Claim>) => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    setSelectedUserIds(selectedIds);
  };

  const confirmPaid = () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one claim to paid",
      });
      return;
    }
    setShowPaidConfirm(true);
  };

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim)
    setOpenDetail(true)
}

  const handleApprove = () => {
    paidMutation.mutate(selectedUserIds);
  };

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
    );
  }

  return (
    <>
      <div className="container mx-auto py-10 px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Approved Claims</h1>
          <p className="text-muted-foreground">
            Manage your claims and their permissions.
          </p>
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <Button
            onClick={confirmPaid}
            variant="outline"
            className="h-8 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
            disabled={selectedUserIds.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Paid ({selectedUserIds.length})
          </Button>
        </div>
        <DataTable
          columns={createColumns(handleViewDetail)}
          data={claim}
          searchKey="staffName"
          searchKeyAlt="projectName"
          searchPlaceholder="Search by staff or project..."
          onSelectionChange={handleSelectionChange}
          // filters={[
          //     {
          //     //     columnId: "roleName",
          //     //     title: "Role",
          //     //     options: [
          //     //         { label: "Admin", value: "ADMIN" },
          //     //         { label: "Staff", value: "STAFF" },
          //     //         { label: "Approver", value: "APPROVER" },
          //     //         { label: "Finance", value: "FINANCE" },
          //     //     ],
          //     // },
          //     // {
          //     //     columnId: "isActive",
          //     //     title: "Status",
          //     //     options: [
          //     //         { label: "Active", value: true },
          //     //         { label: "Inactive", value: false },
          //     //     ],
          //     // },
          //     // {
          //     //     columnId: "department",
          //     //     title: "Department",
          //     //     options: [
          //     //         { label: "Software Development", value: "SoftwareDevelopment" },
          //     //         { label: "Finance", value: "Finance" },
          //     //     ],
          //     // },
          // ]}
        />
         <ClaimDetail 
                        claim={selectedClaim} 
                        open={openDetail} 
                        onOpenChange={setOpenDetail} 
                        showActions={false} 
                    />
        {/* <UserForm open={openUserForm} onOpenChange={setOpenUserForm} mode="create" onSuccess={fetchClaim} /> */}
      </div>
      <AlertDialog open={showPaidConfirm} onOpenChange={setShowPaidConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paid Claims</AlertDialogTitle>
<AlertDialogDescription>
  This action will pay the claim.
  <br />
  Please click ‘OK’ to receive the claim or ‘Cancel’ to close the dialog.
</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={paidMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={paidMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {paidMutation.isPending ? "Pending..." : "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
