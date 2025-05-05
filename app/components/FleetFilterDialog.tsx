import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Filter, Search, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import React, {useState, useMemo, useCallback} from "react";
import {useVirtualizer, VirtualItem} from "@tanstack/react-virtual";

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
}: FleetFilterDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Filter fleet names based on search query
  const filteredFleetNames = useMemo(() => {
    if (!searchQuery) return allFleetNames;
    const query = searchQuery.toLowerCase();
    return allFleetNames.filter(name => name.toLowerCase().includes(query));
  }, [allFleetNames, searchQuery]);

  // Virtual list setup
  const rowVirtualizer = useVirtualizer({
    count: filteredFleetNames.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Estimated height of each row
    overscan: 5, // Number of items to render outside of the visible area
  });

  // Debounced search handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search fleets..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div 
          ref={parentRef}
          className="max-h-[300px] overflow-y-auto border rounded-md"
          style={{
            height: `${Math.min(filteredFleetNames.length * 40, 300)}px`,
            width: '100%',
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
              const name = filteredFleetNames[virtualRow.index];
              return (
                <div
                  key={name}
                  className="flex items-center space-x-2 py-2 px-2 border-b last:border-0"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Checkbox
                    id={`fleet-${name}`}
                    checked={fleetNameFilters[name] || false}
                    onCheckedChange={(checked) => toggleFleetFilter(name, checked === true)}
                  />
                  <Label htmlFor={`fleet-${name}`} className="flex-1 truncate">
                    {name}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Apply Filters</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
