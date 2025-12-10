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
import { claimApi } from "@/services/api/claimApi";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export default function UpdateClaim() {
  const form = useForm();
  const param = useParams<{ id: string }>();

  const fieldArray = useFieldArray({
    control: form.control,
    name: "claimDetails",
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: ["initClaim"],
        queryFn: claimApi.init,
      },
      {
        queryKey: ["getClaimId", param?.id],
        queryFn: () => claimApi.getById(param?.id),
      },
    ],
  });

  const claimQuery = queries[1].data;
  const initQuery = queries[0].data;

  

  const [projectItems, setProjectItems] = React.useState<
    { value: string; label: string, startDate : Date, endDate : Date }[]
  >([]);

  useEffect(() => {
    if (initQuery?.data?.projects) {
      const items = initQuery.data.projects.map((project: any) => ({
        value: project.projectId,
        label: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate
      }));
      setProjectItems(items);
    } else {
      setProjectItems([]);
    }
  }, [initQuery?.data?.data?.projects]);

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
          {false ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Form {...form}>
              <div className="grid grid-flow-col grid-cols-2 gap-3">
                <FormInput
                  label="Staff ID"
                  name="staffId"
                  placeholder="Enter staff ID"
                  defaultValue={initQuery?.data.staffId}
                  readOnly
                />
                <FormInput
                  label="Staff Name"
                  name="staffName"
                  placeholder="Enter staff name"
                  defaultValue={initQuery?.data.staffName}
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
                    const project = projectItems.filter((item) => item.value === values);
                    form.setValue("projectDateRange[0]", new Date(project[0].startDate));
                    form.setValue("projectDateRange[1]", new Date(project[0].endDate));
                  }}
                />
              </div>
              <div className="grid grid-flow-col grid-cols-2 gap-4">
                <FormInput
                  label="Project Duration"
                  name="projectDuration"
                  placeholder="Enter project duration"
                  defaultValue={initQuery?.data.projectDuration ?? "Not available"}
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
              <Button onClick={() => fieldArray.append({})}>Add row</Button>
            </Form>
          )}
          {/* </FormProvider> */}
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
