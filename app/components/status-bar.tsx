"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusBarProps {
  relativeTimeString: string
  timeUntilRefresh: string
  isRefreshing: boolean
  onRefresh: () => void
}

export function StatusBar({ relativeTimeString, timeUntilRefresh, isRefreshing, onRefresh }: StatusBarProps) {
  return (
    <div className="text-sm text-muted-foreground mb-4 md:mb-0">
      <div className="flex items-center gap-2">
        <span>Last updated: {relativeTimeString}</span>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-7"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="mt-1">Next auto-update in {timeUntilRefresh}</div>
    </div>
  )
}
