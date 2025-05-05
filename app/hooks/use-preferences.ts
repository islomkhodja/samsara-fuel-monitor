"use client"

import { useState, useEffect } from "react"
import type { Preferences, SortOption, ViewMode, EngineFilter } from "@/app/types"

export function usePreferences() {
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [sortOption, setSortOption] = useState<SortOption>("fuelTimeDesc")
  const [engineFilter, setEngineFilter] = useState<EngineFilter>("All")
  const [fleetNameFilters, setFleetNameFilters] = useState<Record<string, boolean>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  // Load preferences from localStorage on initial render
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPrefs = localStorage.getItem("fuelMonitorPreferences")
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs) as Preferences

          // Apply saved preferences
          if (prefs.viewMode) setViewMode(prefs.viewMode)
          if (prefs.sortOption) setSortOption(prefs.sortOption)
          if (prefs.engineFilter) setEngineFilter(prefs.engineFilter)
          if (prefs.fleetNameFilters) setFleetNameFilters(prefs.fleetNameFilters)
        }
      } catch (error) {
        console.error("Error loading preferences from localStorage:", error)
      }
      setIsInitialized(true)
    }

    loadPreferences()
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return

    const savePreferences = () => {
      try {
        const preferences: Preferences = {
          viewMode,
          sortOption,
          engineFilter,
          fleetNameFilters,
        }
        localStorage.setItem("fuelMonitorPreferences", JSON.stringify(preferences))
      } catch (error) {
        console.error("Error saving preferences to localStorage:", error)
      }
    }

    savePreferences()
  }, [viewMode, sortOption, engineFilter, fleetNameFilters, isInitialized])

  return {
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    engineFilter,
    setEngineFilter,
    fleetNameFilters,
    setFleetNameFilters,
    isInitialized,
  }
}
