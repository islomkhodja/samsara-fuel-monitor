// helper to fetch a single page
import { SamsaraVehicleUI, MotiveResponse, MotiveVehicle } from "@/app/types";

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

  // if we haven't fetched them all yet, recurse
  if (pageNo * pagination.per_page < pagination.total) {
    return fetchAllMotiveVehicles(pageNo + 1, perPage, allSoFar);
  }

  // done!
  return allSoFar;
}



// Fetch Motive vehicle stats from all tokens in parallel
export async function fetchMotiveVehicleStats(): Promise<SamsaraVehicleUI[]> {
  // Get all tokens from environment variables
  const tokens = process.env.MOTIVE_API_TOKENS?.split(',') || [];
  
  if (tokens.length === 0) {
    console.error("No Motive API tokens provided. Please set MOTIVE_API_TOKENS environment variable.");
    return [];
  }

  try {
    // Fetch data from all tokens in parallel
    const results = await Promise.all(
      tokens.map(token => fetchVehicleStatsForToken(token.trim()))
    );

    // Combine all results
    const allVehicles = results.flat();

    // Remove duplicates based on vehicle ID
    const uniqueVehicles = Array.from(
      new Map(allVehicles.map(vehicle => [vehicle.id, vehicle])).values()
    );

    // Sort by most recent fuel update
    uniqueVehicles.sort((a, b) => {
      const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0;
      const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0;
      return timeB - timeA;
    });

    return uniqueVehicles;
  } catch (error) {
    console.error("Error fetching vehicle stats:", error);
    return [];
  }
}

// Fetch vehicle stats for a specific Motive token
export async function fetchVehicleStatsForToken(token: string): Promise<SamsaraVehicleUI[]> {
  let currentUrl = `https://api.gomotive.com/v2/vehicle_locations?per_page=100&page_no=1`;
  let pageNo = 1;
  const result: SamsaraVehicleUI[] = [];

  try {
    while (true) {
      console.log("Fetching Motive data:", currentUrl);
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-api-key": token,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = (await response.json()) as MotiveResponse;
      
      // Map the vehicles to SamsaraVehicleUI format
      const mappedVehicles = data.vehicles.map((item: MotiveVehicle): SamsaraVehicleUI => {
        const motVehicle = item.vehicle;
        return {
          id: motVehicle.id?.toString() ?? "",
          name: (motVehicle.number
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
            value: motVehicle.current_location?.speed ? "On" : "Idle",
          },
          gps: {
            time: motVehicle.current_location?.located_at || "",
            latitude: motVehicle.current_location?.lat || 0,
            longitude: motVehicle.current_location?.lon || 0,
            headingDegrees: motVehicle.current_location?.bearing || 0,
            speedMilesPerHour: motVehicle.current_location?.speed || 0,
            reverseGeo: { formattedLocation: motVehicle.current_location?.description || "" },
            address: {
              id: "",
              name: motVehicle.current_location?.description || "",
            },
            isEcuSpeed: false,
          },
        };
      });

      result.push(...mappedVehicles);

      // Check if we need to fetch more pages
      if (pageNo * data.pagination.per_page < data.pagination.total) {
        pageNo++;
        currentUrl = `https://api.gomotive.com/v2/vehicle_locations?per_page=100&page_no=${pageNo}`;
      } else {
        break;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching Motive vehicle stats for token:", error);
    return [];
  }
}

// Existing mapper for Motive data
export function mapSimpleMotiveResponse(response: SamsaraVehicleUI[]): SamsaraVehicleUI[] {
  return response.map((vehicle: SamsaraVehicleUI): any => ({
    id: vehicle.id || "",
    name: vehicle.name || "",
    externalIds: {
      "samsara.vin": vehicle?.externalIds?.["samsara.vin"] || undefined,
      "samsara.serial": vehicle.externalIds?.["samsara.serial"] || undefined,
    },
    fuelPercent: vehicle?.fuelPercent
      ? vehicle.fuelPercent
      : {
        time: "",
        value: 0,
      },
    engineState: vehicle?.engineState
      ? vehicle.engineState
      : {
        time: "",
        value: "Off",
      },
    gps: vehicle?.gps
      ? vehicle.gps
      : {
        time: "",
        latitude: null,
        longitude: null,
        headingDegrees: null,
        speedMilesPerHour: null,
        reverseGeo: { formattedLocation: "" },
        address: {
          id: "",
          name: "",
        },
        isEcuSpeed: false,
      },
  }));
}