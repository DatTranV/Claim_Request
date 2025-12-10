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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { claimApi } from "@services/api/claimApi";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

export default function CreateClaim() {
  const form = useForm();

  const fieldArray = useFieldArray({
    control: form.control,
    name: "claimDetails",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["initClaim"],
    queryFn: claimApi.init,
  });

  const [projectItems, setProjectItems] = React.useState<
    { value: string; label: string; startDate: Date; endDate: Date }[]
  >([]);

  useEffect(() => {
    if (data?.data.projects) {
      const items = data.data.projects.map((project: any) => ({
        value: project.projectId,
        label: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
      }));
      setProjectItems(items);
    } else {
      setProjectItems([]);
    }
  }, [data?.data.projects]);

  useEffect(() => {
    if (isLoading) {
      console.log("Loading");
      return;
    }
    console.log(data);
  }, [data, isLoading]);

  useEffect(() => {
    console.log(form.watch());
  });

  return (
    <>
      <Card className="">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Create project</CardTitle>
          <CardDescription>Status: Draft</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <FormProvider {...form}>  */}
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Form {...form}>
              <div className="grid grid-flow-col grid-cols-2 gap-3">
                <FormInput
                  label="Staff ID"
                  name="staffId"
                  placeholder="Enter staff ID"
                  defaultValue={data?.data.staffId}
                  readOnly
                />
                <FormInput
                  label="Staff Name"
                  name="staffName"
                  placeholder="Enter staff name"
                  defaultValue={data?.data.staffName}
                  readOnly
                />
              </div>
              <div className="grid grid-flow-col grid-cols-2 gap-4">
                <FormInput label="Department" name="department" readOnly />
                <FormOption
                  placeholder="Select project"
                  label="Project"
                  name="project"
                  options={projectItems}
                  onChange={(values: any) => {
                    const project = projectItems.filter(
                      (item) => item.value === values
                    );
                    form.setValue(
                      "projectDateRange[0]",
                      new Date(project[0].startDate)
                    );
                    form.setValue(
                      "projectDateRange[1]",
                      new Date(project[0].endDate)
                    );
                  }}
                />
              </div>
              <div className="grid grid-flow-col grid-cols-2 gap-4">
                <FormInput
                  label="Project Duration"
                  name="projectDuration"
                  placeholder="Enter project duration"
                  defaultValue={data?.data.projectDuration ?? "Not available"}
                />
                <DateRangePicker
                  name="projectDateRange"
                  label="Date Range"
                  onChange={(value: any) => {
                    const diff =
                      new Date(value[1]).getDate() -
                      new Date(value[0]).getDate();
                    form.setValue("projectDuration", diff);
                  }}
                />
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
                            {...form.register(
                              `claimDetails.${index}.totalWork`
                            )}
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
              <Button className="mx-1 my-2" onClick={() => fieldArray.append({})}>Add row</Button>
              <Separator />
              <div className="my-2">
                <Button className="mx-1">Submit</Button>
                <Button className="mx-1">Save</Button>
                <Button className="mx-1">Cancel</Button>
              </div>
            </Form>
          )}
          {/* </FormProvider> */}
        </CardContent>
      </Card>
    </>
  );
}
