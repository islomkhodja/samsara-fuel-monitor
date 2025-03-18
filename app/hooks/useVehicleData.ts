import {useCallback, useEffect, useRef, useState} from "react";
import {SamsaraVehicleUI} from "@/app/types";
import {isWithinLastTwoDays} from "@/app/util";

export const useVehicleData = () => {
  const [vehicles, setVehicles] = useState<SamsaraVehicleUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentDataCount, setRecentDataCount] = useState(0)
  const [totalVehicleCount, setTotalVehicleCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const nextRefreshRef = useRef(new Date(Date.now() + 5 * 60 * 1000))

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsRefreshing(true)
    try {
      const response = await fetch("/api/vehicles")
      const data: SamsaraVehicleUI[] = await response.json()

      setTotalVehicleCount(data.length)
      const recentVehicles = data.filter(
        (vehicle) => vehicle.fuelPercent && isWithinLastTwoDays(vehicle.fuelPercent.time),
      )
      setRecentDataCount(recentVehicles.length)
      setVehicles(recentVehicles)
      setLastUpdated(new Date())
      nextRefreshRef.current = new Date(Date.now() + 5 * 60 * 1000)
    } catch (error) {
      console.error("Error fetching vehicle data:", error)
    } finally {
      if (isInitialLoad) {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData(false)
    }, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [fetchData])

  return {
    vehicles,
    isLoading,
    isRefreshing,
    fetchData,
    lastUpdated,
    recentDataCount,
    totalVehicleCount,
    nextRefresh: nextRefreshRef.current,
  }
}
