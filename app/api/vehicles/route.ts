import { NextResponse } from "next/server";
import { fetchSamsaraVehicleStats } from "@/app/api/vehicles/fetch-samsara";
import { fetchMotiveVehicleStats } from "@/app/api/vehicles/fetch-motive";

// GET API route
export async function GET() {
  try {
    // Fetch data from both sources in parallel
    const [samsaraData, motiveData] = await Promise.all([
      fetchSamsaraVehicleStats(),
      fetchMotiveVehicleStats()
    ]);

    // Combine both datasets
    const allVehicles = [...samsaraData, ...motiveData];

    // Sort by most recent fuel update
    allVehicles.sort((a, b) => {
      const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0;
      const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json(allVehicles);
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle data" }, { status: 500 });
  }
}


