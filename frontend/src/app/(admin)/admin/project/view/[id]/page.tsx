import ButtonLink from "@/components/button/ButtonLink";
import InfoInput from "@/components/info/InfoInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { projectApi } from "@/services/api/projectApi";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

    


export default function ViewProject() {
  const param = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["getProjectId", param?.id],
    queryFn: () => projectApi.getProjectById(param?.id),
  });

  return (
    <>
      {isLoading ? (
        <Loader2 size={32} className="animate-spin" />
      ) : (
        <Card className="">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Project Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoInput label="Project ID" value={data?.data.id}/>
              <InfoInput label="Project Code" value={data?.data.projectCode} />
              <InfoInput
                label="Project Name"
                value={data?.data.projectName}
              />
              <InfoInput label="Start Date" value={data?.data.startDate} />
              <InfoInput label="End Date" value={data?.data.endDate} />
              <InfoInput label="Budget" value={String(data?.data.budget)} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
              <ButtonLink to={`/admin/project/update/${param?.id}`} label="Edit" />
              <Button>Delete</Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
