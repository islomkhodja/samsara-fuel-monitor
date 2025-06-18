import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter, Search, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import * as XLSX from "xlsx";

interface FleetFilterDialogProps {
  allFleetNames: string[];
  fleetNameFilters: Record<string, boolean>;
  activeFleetFilters: string[];
  toggleAllFleets: (checked: boolean) => void;
  toggleFleetFilter: (name: string, checked: boolean) => void;
}

/**
 * Helper: strip every non‑alphanumeric char & collapse spaces → for fuzzy matching.
 */
const normalise = (str: string) => str.replace(/[^\da-z]/gi, "").toLowerCase();

export const FleetFilterDialog = ({
  allFleetNames,
  fleetNameFilters,
  activeFleetFilters,
  toggleAllFleets,
  toggleFleetFilter,
}: FleetFilterDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = React.useRef<HTMLDivElement>(null);

  /* -------------------------------------------------
   * Build lookup <normalised → canonical name>
   * e.g. "unit8509" and "8509" will both map to the same entry.
   * ------------------------------------------------*/
  const lookup = useMemo(() => {
    const map = new Map<string, string>();
    allFleetNames.forEach((fleet) => {
      const n = normalise(fleet);
      if (!map.has(n)) map.set(n, fleet);

      // If the fleet starts with UNIT# 8509 – also add the numeric tail only
      const numeric = fleet.match(/\d{3,}/)?.[0];
      if (numeric) map.set(numeric, fleet);
    });
    return map;
  }, [allFleetNames]);

  /* -------------------- Excel upload handler -------------------*/
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], {
          header: 0,
          blankrows: false,
        });

        const HEADERS = ["TRUCK #", "TRUCK", "truck"];
        const unmatched: string[] = [];

        rows.forEach((row) => {
          for (const h of HEADERS) {
            const cell = row[h];
            if (cell != null) {
              const raw = String(cell).trim();
              const key = normalise(raw);
              const canonical = lookup.get(key);
              if (canonical) {
                toggleFleetFilter(canonical, true);
              } else {
                unmatched.push(raw);
              }
              break;
            }
          }
        });

        if (unmatched.length) {
          console.warn("Unmatched fleet names:", unmatched.slice(0, 20), "…", unmatched.length);
        }
      } catch (err) {
        console.error("Failed to parse Excel", err);
        alert("Could not read fleet names from the uploaded file. Please check the template.");
      }
    },
    [lookup, toggleFleetFilter]
  );

  /* ---------------- search & filter ---------------- */
  const filteredFleetNames = useMemo(() => {
    if (!searchQuery) return allFleetNames;
    const q = searchQuery.toLowerCase();
    return allFleetNames.filter((n) => n.toLowerCase().includes(q));
  }, [allFleetNames, searchQuery]);

  /* --------------- virtual list --------------- */
  const rowVirtualizer = useVirtualizer({
    count: filteredFleetNames.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [fleetNameFilters, rowVirtualizer]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Fleet Filter
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

        {/* Excel upload */}
        <div className="flex items-center space-x-2 mb-4">
          <Label htmlFor="fleet-excel" className="flex items-center gap-1 cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Excel
          </Label>
          <Input id="fleet-excel" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Select / Clear all */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAll"
              checked={Object.values(fleetNameFilters).every(Boolean)}
              onCheckedChange={(c) => toggleAllFleets(c === true)}
            />
            <Label htmlFor="selectAll">Select All</Label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toggleAllFleets(false)} className="text-xs">
            <X className="h-3 w-3 mr-1" /> Clear All
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input className="pl-10" placeholder="Search fleets..." value={searchQuery} onChange={handleSearch} />
        </div>

        {/* Virtualised list */}
        <div ref={parentRef} className="max-h-[300px] overflow-y-auto border rounded-md" style={{ height: `${Math.min(filteredFleetNames.length * 40, 300)}px` }}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((v: VirtualItem) => {
              const name = filteredFleetNames[v.index];
              return (
                <div key={name} className="flex items-center space-x-2 py-2 px-2 border-b last:border-0" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${v.size}px`, transform: `translateY(${v.start}px)` }}>
                  <Checkbox id={`fleet-${name}`} checked={fleetNameFilters[name] || false} onCheckedChange={(c) => toggleFleetFilter(name, c === true)} />
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
