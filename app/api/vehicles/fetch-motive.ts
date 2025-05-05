// helper to fetch a single page
import {SamsaraVehicleUI} from "@/app/types";

export async function fetchMotivePage(pageNo: number, perPage: number): Promise<{
  vehicles: any[];
  pagination: { per_page: number; page_no: number; total: number };
}> {
  const url = `https://api.gomotive.com/v2/vehicle_locations?per_page=${perPage}&page_no=${pageNo}`;
  console.log("Fetching Motive data:", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": process.env.MOTIVE_API_KEY || "",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error fetching page ${pageNo}: ${response.status}`);
  }
  return response.json();
}

// recursively fetch all pages
async function fetchAllMotiveVehicles(
  pageNo = 1,
  perPage = 100,
  acc: any[] = []
): Promise<any[]> {
  const {vehicles, pagination} = await fetchMotivePage(pageNo, perPage);
  console.log(`Fetched page ${pageNo} with ${vehicles.length} vehicles`);
  const allSoFar = acc.concat(vehicles);

  // if we haven’t fetched them all yet, recurse
  if (pageNo * pagination.per_page < pagination.total) {
    return fetchAllMotiveVehicles(pageNo + 1, perPage, allSoFar);
  }

  // done!
  return allSoFar;
}

// top‐level fetch: get all pages + map to SamsaraVehicleUI
export async function fetchMotiveVehicleStats(): Promise<SamsaraVehicleUI[]> {
  try {
    // get the raw vehicle objects across *all* pages
    const allVehicles: any[] = await fetchAllMotiveVehicles(/* pageNo */ 1, /* perPage */ 100);

    // now map to your UI type
    return allVehicles.map((item: any) => {
      const motVehicle = item.vehicle;
      return {
        id: motVehicle.id?.toString() ?? "",
        name:
          (motVehicle.number
            ? motVehicle.number + " motive"
            : `${motVehicle.make ?? ""} ${motVehicle.model ?? ""}`.trim() + " motive"),
        externalIds: {
          "samsara.vin": motVehicle.vin || undefined,
          "samsara.serial": undefined,
        },
        fuelPercent: {
          time: motVehicle.current_location?.located_at || "",
          value: motVehicle.current_location?.fuel_primary_remaining_percentage || 0,
        },
        engineState: {
          time: motVehicle.current_location?.located_at || "",
          value: "Idle",
        },
        gps: {
          time: motVehicle.current_location?.located_at || "",
          latitude: motVehicle.current_location?.lat ?? null,
          longitude: motVehicle.current_location?.lon ?? null,
          headingDegrees: motVehicle.current_location?.bearing ?? null,
          speedMilesPerHour: motVehicle.current_location?.speed ?? null,
          reverseGeo: {formattedLocation: motVehicle.current_location?.description || ""},
          address: {
            id: "",
            name: motVehicle.current_location?.description || "",
          },
          isEcuSpeed: false,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching Motive vehicle stats:", error);
    return [];
  }
}
