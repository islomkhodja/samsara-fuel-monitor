import { NextResponse } from "next/server";
import { SamsaraResponse, SamsaraVehicle, SamsaraVehicleUI } from "@/app/types";

// GET API route
export async function GET() {
  // Fetch data from both Samsara (with multiple tokens) and Motive
  // const samsaraData = await fetchVehicleStats();
  const samsaraData = [] as SamsaraVehicleUI[];
  const motiveData = await fetchMotiveVehicleStats();

  // Combine both datasets
  const combinedData = samsaraData.concat(motiveData);

  return NextResponse.json(combinedData);
}

// Check if a date is within the last two days
const isWithinLastTwoDays = (dateString: string): boolean => {
  const date = new Date(dateString);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  return date >= twoDaysAgo;
};

// --- SAMSARA API FUNCTIONS ---

// Fetch vehicle stats for a specific Samsara token
async function fetchVehicleStatsForToken(token: string): Promise<SamsaraVehicleUI[]> {
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
    vehicles.sort((a, b) => {
      const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0;
      const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0;
      return timeB - timeA;
    });
    vehicles = vehicles.filter(
      (vehicle) => vehicle.fuelPercent && isWithinLastTwoDays(vehicle.fuelPercent.time)
    );
    return vehicles;
  } catch (error) {
    console.error("Error fetching Samsara vehicle stats for token:", error);
    return [];
  }
}

// Fetch Samsara vehicle stats from both tokens and merge the results
async function fetchVehicleStats(): Promise<SamsaraVehicleUI[]> {
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

// --- MOTIVE API FUNCTIONS ---

// Fetch vehicle stats from the Motive API and map to Samsara format
async function fetchMotiveVehicleStats(): Promise<SamsaraVehicleUI[]> {
  const motiveUrl = "https://api.gomotive.com/v2/vehicle_locations?per_page=100&page_no=1";
  try {
    console.log("Fetching Motive data:", motiveUrl);
    const response = await fetch(motiveUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": process.env.MOTIVE_API_KEY || "",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return mapMotiveResponseToSamsara(data);
  } catch (error) {
    console.error("Error fetching Motive vehicle stats:", error);
    return [];
  }
}

// Map Motive API response to the SamsaraVehicleUI format
export function mapMotiveResponseToSamsara(motiveResponse: any): SamsaraVehicleUI[] {
  return motiveResponse.vehicles.map((item: any): SamsaraVehicleUI => {
    const motVehicle = item.vehicle;
    return {
      id: motVehicle.id ? motVehicle.id.toString() : "",
      name: motVehicle.number + ' motive' || `${motVehicle.make || ""} ${motVehicle.model || ""}`.trim() + ' motive',
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
        latitude: motVehicle.current_location?.lat || null,
        longitude: motVehicle.current_location?.lon || null,
        headingDegrees: motVehicle.current_location?.bearing || null,
        speedMilesPerHour: motVehicle.current_location?.speed || null,
        reverseGeo: { formattedLocation: motVehicle.current_location?.description || "" },
        address: {
          id: "",
          name: motVehicle.current_location?.description || "",
        },
        isEcuSpeed: false,
      },
    };
  });
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

export function mapSamsaraResponse(response: SamsaraVehicle[]): SamsaraVehicleUI[] {
  return response.map((vehicle: SamsaraVehicle): any => ({
    id: vehicle.id || "",
    name: vehicle.name || "",
    externalIds: {
      "samsara.vin": vehicle?.externalIds?.["samsara.vin"] || undefined,
      "samsara.serial": vehicle.externalIds?.["samsara.serial"] || undefined,
    },
    fuelPercent: vehicle?.fuelPercents?.length
      ? vehicle.fuelPercents[0]
      : {
        time: "",
        value: 0,
      },
    engineState: vehicle?.engineStates?.length
      ? vehicle.engineStates[0]
      : {
        time: "",
        value: "Off",
      },
    gps: vehicle?.gps?.length
      ? vehicle.gps[0]
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
