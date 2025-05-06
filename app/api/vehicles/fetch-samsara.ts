// Fetch vehicle stats for a specific Samsara token
import { SamsaraResponse, SamsaraVehicleUI } from "@/app/types";

export async function fetchVehicleStatsForToken(token: string): Promise<SamsaraVehicleUI[]> {
  const url = `https://api.samsara.com/fleet/vehicles/stats?types=engineStates,fuelPercents,gps`;
  let newUrl = url;
  const result: { data: SamsaraVehicleUI[]; pagination: { endCursor: string; hasNextPage: boolean } } = {
    data: [],
    pagination: {
      endCursor: "",
      hasNextPage: false,
    },
  };

  try {
    while (true) {
      console.log("Fetching Samsara data:", newUrl);
      const response = await fetch(newUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = (await response.json()) as SamsaraResponse;
      result.data = result.data.concat(data.data);
      if (data.pagination?.hasNextPage) {
        newUrl = `${url}&after=${data.pagination.endCursor}`;
      } else {
        break;
      }
    }
    // Map, sort, and filter vehicles from the last two days
    let vehicles = mapSimpleSamsaraResponse(result.data);
    return vehicles;
  } catch (error) {
    console.error("Error fetching Samsara vehicle stats for token:", error);
    return [];
  }
}

// Fetch Samsara vehicle stats from all tokens in parallel
export async function fetchSamsaraVehicleStats(): Promise<SamsaraVehicleUI[]> {
  // Get all tokens from environment variables
  const tokens = process.env.SAMSARA_API_TOKENS?.split(',') || [];
  
  if (tokens.length === 0) {
    console.error("No Samsara API tokens provided. Please set SAMSARA_API_TOKENS environment variable.");
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

// Existing mapper for Samsara data
export function mapSimpleSamsaraResponse(response: SamsaraVehicleUI[]): SamsaraVehicleUI[] {
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
