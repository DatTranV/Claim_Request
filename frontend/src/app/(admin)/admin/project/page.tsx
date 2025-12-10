"use client";

import ButtonLink from "@/components/button/ButtonLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectApi } from "@/services/api/projectApi";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ChevronDown, Loader2, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/toaster";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ProjectManagement() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageSize] = useState(6); // Fixed page size
  const [loading, setLoading] = useState<boolean>(true);
  const [allProject, setAllProject] = useState<any[]>([]); // Store all fish
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    isAvailableForSale: "",
    isSold: "",
    isConsigned: "",
    showFarmOwned: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["allProjects"],
    queryFn: projectApi.getAllProject,
  });

  useEffect(() => {
    fetchAllProject();
  }, [searchTerm, selectedBreed, sortBy, filters]); // Remove currentPage from dependencies

  const fetchAllProject = async () => {
    setLoading(true);
    const queryParams: ProjectQueryParams = {
      searchTerm: searchTerm || undefined,
      koiBreedId: selectedBreed ? parseInt(selectedBreed) : undefined,
      sortBy: sortBy || undefined,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
      isAvailableForSale: filters.isAvailableForSale
        ? filters.isAvailableForSale === "true"
        : undefined,
      isSold: filters.isSold ? filters.isSold === "true" : undefined,
      isConsigned: filters.isConsigned
        ? filters.isConsigned === "true"
        : undefined,
      showFarmOwned: filters.showFarmOwned,
    };

    const response = await projectApi.getProject(queryParams);
    if (response.isSuccess) {
      setAllProject(response.data);
      setTotalPages(Math.ceil(response.data.length / pageSize));
    }
    setLoading(false);
  };


  const handlePageChange = async (newPage: number) => {
    setPageLoading(true);
    setCurrentPage(newPage);

    // Add delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setPageLoading(false);
  };
  const getCurrentPageItems = (): any[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allProject.slice(startIndex, endIndex);
  };
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = 5;

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(
        1,
        currentPage - Math.floor(totalPageNumbers / 2),
      );
      let endPage = Math.min(totalPages, startPage + totalPageNumbers - 1);

      if (endPage - startPage + 1 < totalPageNumbers) {
        startPage = Math.max(1, endPage - totalPageNumbers + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (startPage > 1) {
        pageNumbers.unshift("...");
      }
      if (endPage < totalPages) {
        pageNumbers.push("...");
      }
    }

    return pageNumbers;
  };



  return (
    <div className="p-4">
      <Toaster />
      <div className="flex items-center justify-between w-full gap-2 mb-6">
        <h2 className="text-2xl font-bold flex-1">Project</h2>
        <Button variant="default" onClick={() => handleOpenProjectDialog(null)}>
          <PlusIcon className="w-4 h-4" />
          <span>Create Project</span>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Project ID</TableCell>
            <TableCell>Project Name</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Budget</TableCell>
            <TableCell className="text-center">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center animate-spin">
                <Loader2 size={32} />
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((project: any, index: number) => (
              <TableRow key={project.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.projectName}</TableCell>
                <TableCell>{project.startDate}</TableCell>
                <TableCell>{project.endDate}</TableCell>
                <TableCell>${project.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="px-2">
                        <ChevronDown size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                      <DropdownMenuItem>
                        <ButtonLink to={`/project/view/${project.id}`} label="View" className="w-full text-left"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ButtonLink to={`/project/update/${project.id}`} label="Update" className="w-full text-left"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button variant="destructive" className="w-full text-left">
                          Cancel
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && allProject.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage !== 1 && (
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                  // disabled={pageLoading}
                  />
                )}
              </PaginationItem>
              {getPageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                    // disabled={pageLoading}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                {currentPage !== totalPages && (
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                  // disabled={pageLoading}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
