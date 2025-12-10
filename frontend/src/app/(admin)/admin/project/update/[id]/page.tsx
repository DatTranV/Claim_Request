"use client";

import DateRangePicker from "@/components/form/DateRangePicker";
import FormInput from "@/components/form/FormInput";
import FormOption from "@/components/form/FormOption";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";

export default function UpdateProjectInformation() {
  const form = useForm();

  const fieldArray = useFieldArray({
    control: form.control,
    name: "claimDetails",
  });

  return (
    <>
      <Card className="">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Create project</CardTitle>
          <CardDescription>Status: Draft</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-flow-col grid-cols-2 gap-3">
              <FormInput
                label="Staff ID"
                name="staffId"
                placeholder="Enter staff ID"
              />
              <FormInput
                label="Staff Name"
                name="staffName"
                placeholder="Enter staff name"
              />
            </div>
            <div className="grid grid-flow-col grid-cols-2 gap-4">
              <FormInput label="Department" name="department" readOnly />
              <FormOption
                placeholder="Select project"
                label="Project"
                name="project"
                options={[]}
              />
            </div>
            <div className="grid grid-flow-col grid-cols-2 gap-4">
              <FormInput
                label="Project Duration"
                name="projectDuration"
                placeholder="Enter project duration"
              />
              <DateRangePicker name="projectDateRange" label="Date Range" />
            </div>{" "}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>From - To</TableCell>
                  <TableCell>Total Work</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldArray.fields.map((field, index) => (
                  <>
                    <TableRow id={field.id} key={field.id}>
                      <TableCell>
                        <Input
                          {...form.register(`claimDetails.${index}.day`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`claimDetails.${index}.date`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          {...form.register(`claimDetails.${index}.from`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          {...form.register(`claimDetails.${index}.to`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`claimDetails.${index}.totalWork`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`claimDetails.${index}.remark`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => fieldArray.remove(index)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
            <Button onClick={() => fieldArray.append({})}>Add row</Button>
          </Form>
        </CardContent>
        <CardFooter>
            <Button>Submit</Button>
            <Button>Save</Button>
            <Button>Cancel</Button>
        </CardFooter>
      </Card>
    </>
  );
}
