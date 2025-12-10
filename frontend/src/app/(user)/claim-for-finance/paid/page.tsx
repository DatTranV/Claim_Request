"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useToast } from "@/hooks/use-toast";
import {
  createColumns,
  Claim,
} from "../../claim-for-approval/components/column";
import { claimApi } from "@/services/api/claimApi";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { ClaimDetail } from "../../claim-for-approval/components/claim-detail";

export default function UsersPage() {
  const [claim, setClaim] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<Table<Claim> | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const response = await claimApi.claimForApproval("paid");
      const data = await response.data;
      setClaim(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch claim",
        // variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (selectedUserIds.length === 0) {
        toast({
          title: "Warning",
          description: "Please select at least one claim to download",
          // variant: "destructive",
        });
        return;
      }

      const response = await claimApi.downloadClaim(selectedUserIds);
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Template_Export_Claim.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Successfully downloaded claims",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download claims",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClaim();
  }, []);

  const handleSelectionChange = (table: Table<Claim>) => {
    setSelectedRows(table);
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    setSelectedUserIds(selectedIds);
    console.log(selectedIds);
  };

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim)
    setOpenDetail(true)
  }

  if (loading) {
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
    <div className="container mx-auto py-10 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paid Claims</h1>
        <p className="text-muted-foreground">
          Manage your claims and their permissions.
        </p>
      </div>
      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="h-8"
          disabled={selectedUserIds.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download claim ({selectedUserIds.length})
        </Button>
      </div>
      <DataTable
        columns={createColumns(handleViewDetail)}
        data={claim}
        searchKey="staffName"
        searchKeyAlt="projectName"
        searchPlaceholder="Search by staff or project..."
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
        onSelectionChange={handleSelectionChange}
      />
      <ClaimDetail
        claim={selectedClaim}
        open={openDetail}
        onOpenChange={setOpenDetail}
        showActions={false}
      />
      {/* <UserForm open={openUserForm} onOpenChange={setOpenUserForm} mode="create" onSuccess={fetchClaim} /> */}
    </div>
  );
}
