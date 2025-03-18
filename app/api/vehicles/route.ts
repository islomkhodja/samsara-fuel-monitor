import { NextResponse } from "next/server"
import {SamsaraResponse, SamsaraVehicle, SamsaraVehicleUI} from "@/app/types";



// This is a mock API route that returns the Samsara vehicle data
// In a real application, this would make a request to the Samsara API
export async function GET() {
  // This is the data from the attachment
  const data = await fetchVehicleStats();

  return NextResponse.json(data)
}

// Check if a date is within the last two days
const isWithinLastTwoDays = (dateString: string): boolean => {
  const date = new Date(dateString)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  return date >= twoDaysAgo
}

async function fetchVehicleStats() {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  const twoDayBeforeToday = date.toISOString();
  const url = `https://api.samsara.com/fleet/vehicles/stats?types=engineStates,fuelPercents,gps`;
  let newUrl = url;
  const result: any = {
    data: [],
    pagination: {
      endCursor: '',
      hasNextPage: false
    }
  }
  try {

    while (true) {
      console.log('ishladi', newUrl);
      const response = await fetch(newUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.SAMSARA_API_TOKEN}`,
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

    // return mapSamsaraResponse(result.data);
    // sort by result.data.fuelPercent.time

    let data = mapSimpleSamsaraResponse(result.data);
    data.sort((a, b) => {
      const timeA = a.fuelPercent?.time ? new Date(a.fuelPercent.time).getTime() : 0
      const timeB = b.fuelPercent?.time ? new Date(b.fuelPercent.time).getTime() : 0
      return timeB - timeA
    });

    data = data.filter(
      (vehicle) => vehicle.fuelPercent && isWithinLastTwoDays(vehicle.fuelPercent.time),
    )

    return data;
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
  }
}

export function mapSimpleSamsaraResponse(response: SamsaraVehicleUI[]): SamsaraVehicleUI[] {
  return response.map((vehicle: SamsaraVehicleUI): any => ({
    id: vehicle.id || "",
    name: vehicle.name || "",
    externalIds: {
      "samsara.vin": vehicle?.externalIds?.["samsara.vin"] || undefined,
      "samsara.serial": vehicle.externalIds?.["samsara.serial"] || undefined,
    },
    fuelPercent: vehicle?.fuelPercent
      ? vehicle.fuelPercent : {
        time: "",
        value: 0,
      },
    engineState: vehicle?.engineState
      ? vehicle?.engineState : {
        time: "",
        value: "Off",
      },
    gps: vehicle?.gps
      ? vehicle.gps
      : {
        time: "",
        latitude: null,
        longitude:  null,
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
      ? vehicle.fuelPercents[0] : {
        time: "",
        value: 0,
      },
    engineState: vehicle?.engineStates?.length
      ? vehicle.engineStates[0] : {
        time: "",
        value: "Off",
      },
    gps: vehicle?.gps?.length
      ? vehicle.gps[0]
      : {
        time: "",
        latitude: null,
        longitude:  null,
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





