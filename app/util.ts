export const isWithinLastTwoDays = (dateString: string): boolean => {
  const date = new Date(dateString)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  return date >= twoDaysAgo
}

export const isWithinLastMonth = (dateString: string): boolean => {
  const date = new Date(dateString)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return date >= oneMonthAgo
}

export const getEngineStateVariant = (state: string): "default" | "outline" | "secondary" => {
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

export const formatRelativeTime = (date: Date): string => {
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

export const formatTimeUntilRefresh = (nextRefresh: Date): string => {
  const now = new Date()
  if (now >= nextRefresh) return "refreshing soon..."
  const diffInSeconds = Math.floor((nextRefresh.getTime() - now.getTime()) / 1000)
  const minutes = Math.floor(diffInSeconds / 60)
  const seconds = diffInSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
