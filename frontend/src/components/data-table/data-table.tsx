"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable, FilterFn,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchKeyAlt?: string
    searchPlaceholder?: string
    filters?: {
        columnId: string
        title: string
        options?: {
            label: string
            value: string | number | boolean
            icon?: React.ReactNode
        }[]
    }[]
    onCreateNew?: () => void
    createNewLabel?: string
    onSelectionChange?: (table: Table<TData>) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchKeyAlt,
    searchPlaceholder = "Search...",
    filters = [],
    onCreateNew,
    createNewLabel = "Create New",
    onSelectionChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const safeData = React.useMemo(() => Array.isArray(data) ? data : [], [data])

    const selectionColumnIndex = columns.findIndex((col) => col.id === "select")

    const columnsWithRowNumbers = React.useMemo(() => {
        const rowNumberColumn: ColumnDef<TData, any> = {
            id: "rowNumber",
            header: "#",
            cell: ({ row }) => <div>{row.index + 1}</div>,
            enableSorting: false,
            enableHiding: false,
        }

        if (selectionColumnIndex >= 0) {
            const selectionColumn = columns[selectionColumnIndex]
            const columnsWithoutSelection = columns.filter((col) => col.id !== "select")
            return [selectionColumn, rowNumberColumn, ...columnsWithoutSelection]
        }

        return [rowNumberColumn, ...columns]
    }, [columns, selectionColumnIndex])

    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
        if (!value || value === "") return true

        const searchValue = value.toLowerCase()

        // Nếu đang lọc theo cột cụ thể
        if (columnId !== "global") {
            const cellValue = row.getValue(columnId)
            if (typeof cellValue === "string") {
                return cellValue.toLowerCase().includes(searchValue)
            }
            return false
        }

        // Lọc toàn cục (tìm kiếm trong nhiều cột)
        if (searchKey) {
            const primaryValue = row.getValue(searchKey)
            if (typeof primaryValue === "string" && primaryValue.toLowerCase().includes(searchValue)) {
                return true
            }
        }

        if (searchKeyAlt) {
            const altValue = row.getValue(searchKeyAlt)
            if (typeof altValue === "string" && altValue.toLowerCase().includes(searchValue)) {
                return true
            }
        }

        return false
    }

    const table = useReactTable({
        data: safeData,
        columns: columnsWithRowNumbers,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: (updatedSelection) => {
            setRowSelection(updatedSelection);
            if (onSelectionChange) {
                setTimeout(() => {
                    onSelectionChange(table);
                }, 0);
            }
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                searchKey={searchKey}
                searchKeyAlt={searchKeyAlt}
                searchPlaceholder={searchPlaceholder}
                filters={filters as any}
                onCreateNew={onCreateNew}
                createNewLabel={createNewLabel}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columnsWithRowNumbers.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

