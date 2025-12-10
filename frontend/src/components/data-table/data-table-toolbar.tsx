"use client"

import type * as React from "react"
import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFilter } from "./data-table-filters"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchKey?: string
    searchKeyAlt?: string
    searchPlaceholder?: string
    filters?: {
        columnId: string
        title: string
        options?: {
            label: string
            value: string
            icon?: React.ReactNode
        }[]
    }[]
    onCreateNew?: () => void
    createNewLabel?: string
    globalFilter: string
    setGlobalFilter: (value: string) => void
}

export function DataTableToolbar<TData>({
    table,
    searchKey,
    searchKeyAlt,
    searchPlaceholder = "Search...",
    filters = [],
    onCreateNew,
    createNewLabel = "Create New",
    globalFilter,
    setGlobalFilter,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0 || globalFilter !== ""

    const filteredFilters = filters.filter((filter) => filter.columnId !== searchKey && filter.columnId !== searchKeyAlt)

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {(searchKey || searchKeyAlt) && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="h-8 w-full sm:w-[250px] lg:w-[300px]"
                    />
                )}

                {filteredFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {filteredFilters.map((filter) => (
                            <DataTableFilter
                                key={filter.columnId}
                                table={table}
                                columnId={filter.columnId}
                                title={filter.title}
                                options={filter.options}
                            />
                        ))}
                        {isFiltered && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    table.resetColumnFilters()
                                    setGlobalFilter("")
                                }}
                                className="h-8 px-2 lg:px-3"
                            >
                                Reset
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                {onCreateNew && (
                    <Button onClick={onCreateNew} className="h-8">
                        {createNewLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}

