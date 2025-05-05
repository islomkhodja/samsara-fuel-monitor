"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SamsaraVehicleUI } from "@/app/types"
import { usePreferences } from "./use-preferences"

export function useVehicleData() {
  const [vehicles, setVehicles] = useState<SamsaraVehicleUI[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<SamsaraVehicleUI[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeFleetFilters, setActiveFleetFilters] = useState<string[]>([])
  const [allFleetNames, setAllFleetNames] = useState<string[]>([])
  const [recentDataCount, setRecentDataCount] = useState<number>(0)
  const [totalVehicleCount, setTotalVehicleCount] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [relativeTimeString, setRelativeTimeString] = useState<string>("")
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>("")
  const nextRefreshTimeRef = useRef<Date>(new Date(Date.now() + 5 * 60 * 1000))

  const { sortOption, engineFilter, fleetNameFilters, setFleetNameFilters, isInitialized } = usePreferences()

  // Fetch data function
  const fetchData = useCallback(
    async (isInitialLoad = false) => {
      if (!isInitialLoad) {
        setIsRefreshing(true)
      }

      try {
        const response = await fetch("/api/vehicles")
        const data: SamsaraVehicleUI[] = await response.json()

        // Store the total count for reference
        setTotalVehicleCount(data.length)

        // Filter to only include vehicles with fuel updates in the last two days
        const recentVehicles = data.filter(
          (vehicle) => vehicle.fuelPercent && isWithinLastTwoDays(vehicle.fuelPercent.time),
        )

        setRecentDataCount(recentVehicles.length)
        setVehicles(recentVehicles)

        // Extract all unique fleet names from the filtered data
        const fleetNames = recentVehicles.map((vehicle) => vehicle.name)
        const uniqueFleetNames = [...new Set(fleetNames)]
        setAllFleetNames(uniqueFleetNames)

        // Initialize all fleet names as checked (only on initial load)
        if (isInitialLoad) {
          // Merge saved filters with new fleet names
          const initialFleetState: Record<string, boolean> = {}
          uniqueFleetNames.forEach((name) => {
            // If we have a saved preference for this fleet, use it
            // Otherwise default to true (checked)
            initialFleetState[name] = fleetNameFilters[name] !== undefined ? fleetNameFilters[name] : true
          })
          setFleetNameFilters(initialFleetState)
        }

        // Update last updated timestamp and next refresh time
        setLastUpdated(new Date())
        nextRefreshTimeRef.current = new Date(Date.now() + 5 * 60 * 1000)

        if (isInitialLoad) {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error)
        if (isInitialLoad) {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [fleetNameFilters, setFleetNameFilters],
  )

  const fetchDataRef = useRef(fetchData)

  // Check if a date is within the last two days
  const isWithinLastTwoDays = (dateString: string): boolean => {
    const date = new Date(dateString)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    return date >= twoDaysAgo
  }

  // Format relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  }

  // Format time until next refresh
  const formatTimeUntilRefresh = (): string => {
    const now = new Date()
    const nextRefresh = nextRefreshTimeRef.current

    if (now >= nextRefresh) {
      return "refreshing soon..."
    }

    const diffInSeconds = Math.floor((nextRefresh.getTime() - now.getTime()) / 1000)
    const minutes = Math.floor(diffInSeconds / 60)
    const seconds = diffInSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Update relative time strings
  useEffect(() => {
    // Initial update
    setRelativeTimeString(formatRelativeTime(lastUpdated))
    setTimeUntilRefresh(formatTimeUntilRefresh())

    // Set up interval to update relative time every second
    const intervalId = setInterval(() => {
      setRelativeTimeString(formatRelativeTime(lastUpdated))
      setTimeUntilRefresh(formatTimeUntilRefresh())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [lastUpdated])

  useEffect(() => {
    fetchDataRef.current = fetchData
  }, [fetchData])

  // Initial data load
  useEffect(() => {
    if (isInitialized) {
      console.log("Initial data load")
      fetchData(true)
    }
  }, [isInitialized]) // Only depends on isInitialized, not fetchData

  // Set up auto-refresh interval
  useEffect(() => {
    console.log("Setting up auto-refresh interval")

    const intervalId = setInterval(
      () => {
        console.log("Auto-refresh triggered")
        fetchDataRef.current(false)
      },
      5 * 60 * 1000,
    ) // 5 minutes in milliseconds

    // Clean up interval on component unmount
    return () => {
      console.log("Clearing auto-refresh interval")
      clearInterval(intervalId)
    }
  }, []) // Empty dependency array ensures this only runs once

  // Update active fleet filters when fleetNameFilters changes
  useEffect(() => {
    const active = Object.entries(fleetNameFilters)
      .filter(([_, isChecked]) => isChecked)
      .map(([name]) => name)

    setActiveFleetFilters(active)
  }, [fleetNameFilters])

  // Filter and sort vehicles when dependencies change
  useEffect(() => {
    console.log('Qotoq bosh', sortOption);
    let result = [...vehicles]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.gps.reverseGeo.formattedLocation.toLowerCase().includes(query) ||
          (vehicle.externalIds?.["samsara.vin"] || "").toLowerCase().includes(query),
      )
    }

    // Filter by engine state
    if (engineFilter !== "All") {
      result = result.filter((vehicle) => vehicle.engineState.value === engineFilter)
    }

    // Filter by selected fleet names
    if (activeFleetFilters.length > 0) {
      result = result.filter((vehicle) => activeFleetFilters.includes(vehicle.name))
    }

    // Sort based on selected option
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

    setFilteredVehicles(result)
  }, [vehicles, searchQuery, sortOption, engineFilter, activeFleetFilters])

  // Manual refresh handler
  const handleManualRefresh = useCallback( () => {
    fetchData(false)
  }, [fetchData])

  // Toggle all fleet filters
  const toggleAllFleets = useCallback((checked: boolean) => {
    const updatedFilters = { ...fleetNameFilters }
    Object.keys(updatedFilters).forEach((name) => {
      updatedFilters[name] = checked
    })
    setFleetNameFilters(updatedFilters)
  }, [fleetNameFilters, setFleetNameFilters]);

  // Toggle a single fleet filter
  const toggleFleetFilter = useCallback((name: string, checked: boolean) => {
    setFleetNameFilters((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }, [setFleetNameFilters])

  return {
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
  }
}

