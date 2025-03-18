import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Filter, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import React from "react";

interface FleetFilterDialogProps {
  allFleetNames: string[]
  fleetNameFilters: Record<string, boolean>
  activeFleetFilters: string[]
  toggleAllFleets: (checked: boolean) => void
  toggleFleetFilter: (name: string, checked: boolean) => void
}

export const FleetFilterDialog = ({
                             allFleetNames,
                             fleetNameFilters,
                             activeFleetFilters,
                             toggleAllFleets,
                             toggleFleetFilter,
                           }: FleetFilterDialogProps) => (
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
            checked={Object.values(fleetNameFilters).every((v) => v)}
            onCheckedChange={(checked) => toggleAllFleets(checked === true)}
          />
          <Label htmlFor="selectAll">Select All</Label>
        </div>
        <Button variant="ghost" size="sm" onClick={() => toggleAllFleets(false)} className="text-xs">
          <X className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>
      <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
        {allFleetNames.map((name) => (
          <div key={name} className="flex items-center space-x-2 py-2 border-b last:border-0">
            <Checkbox
              id={`fleet-${name}`}
              checked={fleetNameFilters[name] || false}
              onCheckedChange={(checked) => toggleFleetFilter(name, checked === true)}
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
)
