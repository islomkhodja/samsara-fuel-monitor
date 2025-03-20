"use client"

import { Search, Filter, X, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { SortOption, ViewMode, EngineFilter } from "@/app/types"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  engineFilter: EngineFilter
  onEngineFilterChange: (filter: EngineFilter) => void
  allFleetNames: string[]
  activeFleetFilters: string[]
  onToggleAllFleets: (checked: boolean) => void
  onToggleFleetFilter: (name: string, checked: boolean) => void
  sortOption: SortOption
  onSortOptionChange: (option: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function FilterBar({
                            searchQuery,
                            onSearchChange,
                            engineFilter,
                            onEngineFilterChange,
                            allFleetNames,
                            activeFleetFilters,
                            onToggleAllFleets,
                            onToggleFleetFilter,
                            sortOption,
                            onSortOptionChange,
                            viewMode,
                            onViewModeChange,
                          }: FilterBarProps) {
  return (
    <>
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by vehicle name, location, or VIN..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={engineFilter} onValueChange={(value) => onEngineFilterChange(value as EngineFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Engine State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Engines</SelectItem>
            <SelectItem value="On">Engine On</SelectItem>
            <SelectItem value="Off">Engine Off</SelectItem>
            <SelectItem value="Idle">Engine Idle</SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Fleet Filter
              {activeFleetFilters.length < allFleetNames.length && (
                <Badge variant="secondary" className="ml-1">
                  {activeFleetFilters.length}/{allFleetNames.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter by Fleet Name</DialogTitle>
            </DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={Object.values(activeFleetFilters).length === allFleetNames.length}
                  onCheckedChange={(checked) => onToggleAllFleets(checked === true)}
                />
                <Label htmlFor="selectAll">Select All</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onToggleAllFleets(false)} className="text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
              {allFleetNames.map((name) => (
                <div key={name} className="flex items-center space-x-2 py-2 border-b last:border-0">
                  <Checkbox
                    id={`fleet-${name}`}
                    checked={activeFleetFilters.includes(name)}
                    onCheckedChange={(checked) => onToggleFleetFilter(name, checked === true)}
                  />
                  <Label htmlFor={`fleet-${name}`} className="flex-1 truncate">
                    {name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button>Apply Filters</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active fleet filters display */}
      {activeFleetFilters.length > 0 && activeFleetFilters.length < allFleetNames.length && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-sm text-muted-foreground">Active fleet filters:</span>
          {activeFleetFilters.map((name) => (
            <Badge key={name} variant="outline" className="flex items-center gap-1">
              {name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onToggleFleetFilter(name, false)} />
            </Badge>
          ))}
          {activeFleetFilters.length < allFleetNames.length && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onToggleAllFleets(true)}>
              Show All
            </Button>
          )}
        </div>
      )}

      {/* Sorting and view options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={sortOption} onValueChange={(value) => onSortOptionChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fuelDesc">Highest Fuel First</SelectItem>
              <SelectItem value="fuelAsc">Lowest Fuel First</SelectItem>
              <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
              <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
              <SelectItem value="fuelTimeDesc">Latest Fuel Update</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("card")}
            title="Card View"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

