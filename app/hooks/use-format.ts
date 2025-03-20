"use client"

export function useFormat() {
  // Helper function to format timestamp
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get engine state badge variant
  const getEngineStateVariant = (state: string) => {
    switch (state) {
      case "On":
        return "default"
      case "Idle":
        return "outline"
      case "Off":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return {
    formatTime,
    getEngineStateVariant,
  }
}

