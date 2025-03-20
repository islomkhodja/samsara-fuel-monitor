import { NextResponse } from "next/server"
import { open } from "sqlite"
import sqlite3 from 'sqlite3'

// Define the preferences interface
interface Preferences {
  engineFilter: string
  sortOption: string
  viewMode: string
  fleetNameFilters: Record<string, boolean>
}

// Initialize the database
async function openDb() {
  return open({
    filename: "./preferences.db",
    driver: sqlite3.Database,
  })
}

// Create the table if it doesn't exist
async function initDb() {
  const db = await openDb()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `)
  return db
}

// GET handler to retrieve preferences
export async function GET() {
  try {
    const db = await initDb()
    const result = await db.get("SELECT data FROM preferences WHERE id = 'user_preferences'")

    if (result) {
      return NextResponse.json(JSON.parse(result.data))
    } else {
      // Return default preferences if none are saved
      return NextResponse.json({
        engineFilter: "All",
        sortOption: "fuelTimeDesc",
        viewMode: "card",
        fleetNameFilters: {},
      })
    }
  } catch (error) {
    console.error("Error retrieving preferences:", error)
    return NextResponse.json({ error: "Failed to retrieve preferences" }, { status: 500 })
  }
}

// POST handler to save preferences
export async function POST(request: Request) {
  try {
    const preferences: Preferences = await request.json()
    const db = await initDb()

    // Save preferences to database
    await db.run(
      "INSERT OR REPLACE INTO preferences (id, data) VALUES (?, ?)",
      "user_preferences",
      JSON.stringify(preferences),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}

