"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Search,
  List,
  Grid,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {EngineFilter, SamsaraVehicleUI, SortOption, ViewMode} from "@/app/types"
import {formatRelativeTime, formatTimeUntilRefresh, isWithinLastTwoDays} from "@/app/util";
import {CardView} from "@/app/components/CardView";
import {ListView} from "@/app/components/ListView";
import {FleetFilterDialog} from "@/app/components/FleetFilterDialog";
import {useVehicleData} from "@/app/hooks/useVehicleData";
import {useRelativeTime} from "@/app/hooks/useRelativeTime";

export default function VehicleStatsPage() {
  const {
    vehicles,
    isLoading,
    isRefreshing,
    fetchData,
    lastUpdated,
    recentDataCount,
    totalVehicleCount,
    nextRefresh,
  } = useVehicleData()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("fuelTimeDesc")
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [engineFilter, setEngineFilter] = useState<EngineFilter>("All")
  const [fleetNameFilters, setFleetNameFilters] = useState<Record<string, boolean>>({})
  const [allFleetNames, setAllFleetNames] = useState<string[]>([])

  // Initialize fleet names based on vehicle data.
  useEffect(() => {
    const fleetNames = vehicles.map((vehicle) => vehicle.name)
    const uniqueFleetNames = Array.from(new Set(fleetNames))
    setAllFleetNames(uniqueFleetNames)
    if (Object.keys(fleetNameFilters).length === 0) {
      const initialFilters: Record<string, boolean> = {}
      uniqueFleetNames.forEach((name) => {
        initialFilters[name] = true
      })
      setFleetNameFilters(initialFilters)
    }
  }, [vehicles, fleetNameFilters])

  const activeFleetFilters = useMemo(
    () => Object.entries(fleetNameFilters).filter(([_, isChecked]) => isChecked).map(([name]) => name),
    [fleetNameFilters],
  )

  // Filter and sort vehicles based on search, engine, fleet, and sort options.
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.gps.reverseGeo.formattedLocation.toLowerCase().includes(query) ||
          (vehicle.externalIds?.["samsara.vin"] || "").toLowerCase().includes(query),
      )
    }

    if (engineFilter !== "All") {
      result = result.filter((vehicle) => vehicle.engineState.value === engineFilter)
    }

    if (activeFleetFilters.length > 0) {
      result = result.filter((vehicle) => activeFleetFilters.includes(vehicle.name))
    }

    switch (sortOption) {
      case "fuelDesc":
        result.sort((a, b) => (b.fuelPercent?.value || 0) - (a.fuelPercent?.value || 0))
        break
      case "fuelAsc":
        result.sort((a, b) => (a.fuelPercent?.value || 0) - (b.fuelPercent?.value || 0))
        break
      case "nameAsc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "nameDesc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "fuelTimeDesc":
        result.sort((a, b) => {
          const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0
          const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0
          return timeB - timeA
        })
        break
    }
    return result
  }, [vehicles, searchQuery, engineFilter, activeFleetFilters, sortOption])

  const toggleAllFleets = (checked: boolean) => {
    setFleetNameFilters((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((name) => {
        updated[name] = checked
      })
      return updated
    })
  }

  const toggleFleetFilter = (name: string, checked: boolean) => {
    setFleetNameFilters((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const { relativeTimeString, timeUntilRefresh } = useRelativeTime(lastUpdated, nextRefresh)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Samsara Fuel Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">by Islom Khamid</p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <span>Last updated: {relativeTimeString}</span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7"
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <div className="mt-1">Next auto-update in {timeUntilRefresh}</div>
        </div>
        {recentDataCount < totalVehicleCount && (
          <Alert className="mb-0 py-2 max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Recent Data Only</AlertTitle>
            <AlertDescription className="text-xs">
              Showing {recentDataCount} vehicles with fuel data from the last 2 days.{" "}
              {totalVehicleCount - recentDataCount} vehicles with older data have been filtered out.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by vehicle name, location, or VIN..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={engineFilter} onValueChange={(value) => setEngineFilter(value as EngineFilter)}>
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
          <FleetFilterDialog
            allFleetNames={allFleetNames}
            fleetNameFilters={fleetNameFilters}
            activeFleetFilters={activeFleetFilters}
            toggleAllFleets={toggleAllFleets}
            toggleFleetFilter={toggleFleetFilter}
          />
        </div>
        {activeFleetFilters.length > 0 && activeFleetFilters.length < allFleetNames.length && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Active fleet filters:</span>
            {activeFleetFilters.map((name) => (
              <Badge key={name} variant="outline" className="flex items-center gap-1">
                {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFleetFilter(name, false)} />
              </Badge>
            ))}
            {activeFleetFilters.length < allFleetNames.length && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => toggleAllFleets(true)}>
                Show All
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
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
              onClick={() => setViewMode("card")}
              title="Card View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Loading vehicle data...</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        viewMode === "card" ? <CardView vehicles={filteredVehicles} /> : <ListView vehicles={filteredVehicles} />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No vehicles found matching your search.</p>
        </div>
      )}
    </div>
  )
}
