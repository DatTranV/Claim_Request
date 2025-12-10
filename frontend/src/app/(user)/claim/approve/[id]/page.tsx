"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

export default function ApproveClaim() {
  return (
    <>
      <Card className="">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Claim Request - View</CardTitle>
          <CardDescription>Status: Pending Approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoInput label="Staff Name" value="My Name is Test" />
            <InfoInput label="Staff ID" value="FS12345" />
            <InfoInput label="Staff Department" value="Software Development" />
            <InfoInput label="Role in Project" value="Developer" />
            <InfoInput label="Project Name" value="Project A" />
            <InfoInput
              label="Project Duration"
              value="01/01/2025 - 31/12/2025"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Claim Table:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>08/03/25</TableCell>
                  <TableCell>Sat</TableCell>
                  <TableCell>18:00</TableCell>
                  <TableCell>22:00</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>Overtime</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-2">
              <Label>Total Working Hours: 4</Label>
            </div>
          </div>

          <div className="mb-6">
            <InfoInput
              label="Audit Trail"
              type="textarea"
              value="Worked overtime on feature X"
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button>Approve</Button>
          <Button variant="destructive">Reject</Button>
          <Button variant="secondary">Return</Button>
          <Button variant="outline">Close</Button>
        </CardFooter>
      </Card>
    </>
  );
}
