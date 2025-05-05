import { NextResponse } from "next/server";
import {fetchVehicleStats} from "@/app/api/vehicles/fetch-samsara";
import {fetchMotiveVehicleStats} from "@/app/api/vehicles/fetch-motive";

// GET API route
export async function GET() {
  const [samsaraData, motiveData] = await Promise.all([fetchVehicleStats(), fetchMotiveVehicleStats()]);

  // Combine both datasets
  let combinedData = samsaraData.concat(motiveData);

  combinedData.sort((a, b) => {
    const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0;
    const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0;
    return timeB - timeA;
  });


  return NextResponse.json(combinedData);
}


