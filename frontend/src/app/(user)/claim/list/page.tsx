"use client"

import ButtonLink from "@/components/button/ButtonLink";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { claimApi } from "@/services/api/claimApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";

export default function ListClaim() {

  const { data , isLoading } = useQuery({
    queryKey: ["allClaims"],
    queryFn: claimApi.getAll,
  });

  useEffect(() => {
    console.log(data)
  }, [data]); 

  // const cancelClaim = useMutation(, {
  //   onSuccess: (data) => {
  //     console.log(data)
  //   }
  // });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Claim ID</TableCell>
            <TableCell>Staff Name</TableCell>
            <TableCell>Project Name</TableCell>
            <TableCell>Time Duration</TableCell>
            <TableCell>Total Hours</TableCell>
            <TableCell className="text-center">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          { isLoading ? <TableRow><TableCell colSpan={6} className="text-center"><Loader2 size={32} /></TableCell></TableRow> : 
             data?.data.map((claim: any) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{claim.creator?.fullName}</TableCell>
                  <TableCell>{claim.project?.projectName}</TableCell>
                  <TableCell>{claim.createAt} - {claim.endDate}</TableCell>
                  <TableCell>{claim.totalWorkingHours}</TableCell>
                  <TableCell>
                    <ButtonLink to={`/claim/view/${claim.id}`} label="View" />
                    <ButtonLink to={`/claim/update/${claim.id}`} label="Update"/>
                    <ButtonLink to={`/claim/approve/${claim.id}`} label="Approve"/>
                    <Button>Cancel</Button>
                    <Button>Download</Button>
                  </TableCell>
                </TableRow>
              ))  
          }
        </TableBody>
      </Table>
    </>
  );
}
