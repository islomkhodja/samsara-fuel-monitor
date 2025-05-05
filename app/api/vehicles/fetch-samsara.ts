// Fetch vehicle stats for a specific Samsara token
import {SamsaraResponse, SamsaraVehicleUI} from "@/app/types";
import {isWithinLastMonth} from "@/app/util";

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

// Fetch Samsara vehicle stats from both tokens and merge the results
export async function fetchVehicleStats(): Promise<SamsaraVehicleUI[]> {
  const token1 = process.env.SAMSARA_API_TOKEN;
  const token2 = process.env.SAMSARA_API_TOKEN2;

  let data1: SamsaraVehicleUI[] = [];
  let data2: SamsaraVehicleUI[] = [];

  if (token1) {
    data1 = await fetchVehicleStatsForToken(token1);
  } else {
    console.error("Primary Samsara token (SAMSARA_API_TOKEN) is missing.");
  }

  if (token2) {
    data2 = await fetchVehicleStatsForToken(token2);
  } else {
    console.log("Secondary Samsara token (SAMSARA_API_TOKEN2) not provided, skipping second source.");
  }

  return data1.concat(data2);
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
