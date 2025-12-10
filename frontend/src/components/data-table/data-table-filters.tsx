"use client"

import * as React from "react"
import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DataTableFilterOption {
    label: string
    value: string
    icon?: React.ReactNode
}

export interface DataTableFilterProps<TData> {
    table: Table<TData>
    columnId: string
    title: string
    options?: DataTableFilterOption[]
}

export function DataTableFilter<TData>({ table, columnId, title, options }: DataTableFilterProps<TData>) {
    const column = table.getColumn(columnId)
    const columnFilterValue = column?.getFilterValue() as string

    const [filterValue, setFilterValue] = React.useState(columnFilterValue || "")

    React.useEffect(() => {
        setFilterValue(columnFilterValue || "")
    }, [columnFilterValue])

    if (!column) return null

    // Nếu có options, sử dụng Select
    if (options && options.length > 0) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <span>{title}</span>
                        {column.getIsFiltered() && (
                            <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                                1
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Select
                        value={columnFilterValue || ""}
                        onValueChange={(value) => {
                            column.setFilterValue(value || undefined)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${title}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        {option.icon}
                                        <span>{option.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {column.getIsFiltered() && (
                        <div className="flex items-center justify-between p-2">
                            <div className="text-sm text-muted-foreground">Filtered by {title.toLowerCase()}</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => column.setFilterValue(undefined)}
                                className="h-8 px-2 lg:px-3"
                            >
                                Reset
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        )
    }

    // Nếu không có options, sử dụng Input
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <span>{title}</span>
                    {column.getIsFiltered() && (
                        <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                            1
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2">
                    <Input
                        placeholder={`Filter by ${title.toLowerCase()}...`}
                        value={filterValue}
                        onChange={(e) => {
                            setFilterValue(e.target.value)
                            column.setFilterValue(e.target.value || undefined)
                        }}
                        className="h-8"
                    />
                </div>
                {column.getIsFiltered() && (
                    <div className="flex items-center justify-between p-2">
                        <div className="text-sm text-muted-foreground">Filtered by {title.toLowerCase()}</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterValue("")
                                column.setFilterValue(undefined)
                            }}
                            className="h-8 px-2 lg:px-3"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

