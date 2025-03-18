import {useEffect, useState} from "react";
import {formatRelativeTime, formatTimeUntilRefresh} from "@/app/util";

export const useRelativeTime = (lastUpdated: Date, nextRefresh: Date) => {
  const [relativeTimeString, setRelativeTimeString] = useState(formatRelativeTime(lastUpdated))
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(formatTimeUntilRefresh(nextRefresh))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRelativeTimeString(formatRelativeTime(lastUpdated))
      setTimeUntilRefresh(formatTimeUntilRefresh(nextRefresh))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [lastUpdated, nextRefresh])

  return { relativeTimeString, timeUntilRefresh }
}
