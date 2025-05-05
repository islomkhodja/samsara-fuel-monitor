"use client"
import { AlertCircle } from "lucide-react" // Import AlertCircle from lucide-react
import { useVehicleData } from "@/app/hooks/use-vehicle-data"
import { usePreferences } from "@/app/hooks/use-preferences"
import { FilterBar } from "@/app/components/filter-bar"
import { StatusBar } from "@/app/components/status-bar"
import { VehicleGrid } from "@/app/components/vehicle-grid"
import { VehicleTable } from "@/app/components/vehicle-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Remove AlertCircle from this import

export default function VehicleStatsPage() {
  const {
    vehicles,
    filteredVehicles,
    isLoading,
    isRefreshing,
    lastUpdated,
    relativeTimeString,
    timeUntilRefresh,
    recentDataCount,
    totalVehicleCount,
    allFleetNames,
    activeFleetFilters,
    searchQuery,
    setSearchQuery,
    handleManualRefresh,
    toggleAllFleets,
    toggleFleetFilter,
  } = useVehicleData()

  const { viewMode, setViewMode, sortOption, setSortOption, engineFilter, setEngineFilter } = usePreferences()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Fuel Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">by Islom Khamid</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <StatusBar
          relativeTimeString={relativeTimeString}
          timeUntilRefresh={timeUntilRefresh}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />

        {recentDataCount < totalVehicleCount && (
          <Alert className="mb-0 py-2 max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Recent Data Only</AlertTitle>
            <AlertDescription className="text-xs">
              Showing {recentDataCount} vehicles with fuel data from the last 2 days.
              {totalVehicleCount - recentDataCount} vehicles with older data have been filtered out.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          engineFilter={engineFilter}
          onEngineFilterChange={setEngineFilter}
          allFleetNames={allFleetNames}
          activeFleetFilters={activeFleetFilters}
          onToggleAllFleets={toggleAllFleets}
          onToggleFleetFilter={toggleFleetFilter}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Loading vehicle data...</p>
        </div>
      ) : (
        <>
          {filteredVehicles.length > 0 ? (
            viewMode === "card" ? (
              <VehicleGrid vehicles={filteredVehicles} />
            ) : (
              <VehicleTable vehicles={filteredVehicles} />
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No vehicles found matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
