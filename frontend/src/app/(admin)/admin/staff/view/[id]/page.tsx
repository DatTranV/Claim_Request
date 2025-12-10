"use client"

import ButtonLink from "@/components/button/ButtonLink";
import InfoInput from "@/components/info/InfoInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staffApi } from "@/services/api/staffApi";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { use, useEffect } from "react";

export default function ViewStaff() {
  const param = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["getStaffByID", param?.id],
    queryFn: () => staffApi.getStaff(param?.id),
  });



  return (
    <>
      {isLoading ? (
        <Loader2 size={32} className="animate-spin" />
      ) : (
        <Card className="">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Staff Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoInput label="Staff Name" value={data?.data.fullName} />
              <InfoInput label="Staff ID" value={data?.data.id} />
              <InfoInput
                label="Staff Department"
                value={data?.data.department}
              />
              <InfoInput label="Rank" value={data?.data.rank} />
              <InfoInput label="Role" value={data?.data.roleName} />
              <InfoInput label="Title" value={data?.data.title} />
              <InfoInput label="Salary" value={data?.data.salary} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <ButtonLink to={"/admin/staff/update/" + param?.id} label="Update"/>
            <Button variant="destructive">Delete</Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
