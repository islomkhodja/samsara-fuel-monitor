// Interface based on the Samsara API response structure
export interface SamsaraVehicle {
  id: string;
  name: string;
  externalIds?: {
    "samsara.vin"?: string | null;
    "samsara.serial"?: string | null;
  };
  fuelPercents: {
    time: string;
    value: number;
  }[];
  engineStates: {
    time: string;
    value: "On" | "Off" | "Idle";
  }[];
  gps: {
    time: string
    latitude: number
    longitude: number
    headingDegrees: number
    speedMilesPerHour: number
    reverseGeo: {
      formattedLocation: string
    }
    address?: {
      id: string
      name: string
    }
    isEcuSpeed: boolean
  }[];
}

// Interface based on the Samsara API response structure
export interface SamsaraVehicleUI {
  id: string
  name: string
  externalIds?: {
    "samsara.vin"?: string
    "samsara.serial"?: string
  }
  fuelPercent: {
    time: string
    value: number
  }
  engineState: {
    time: string
    value: "On" | "Off" | "Idle"
  }
  gps: {
    time: string
    latitude: number
    longitude: number
    headingDegrees: number
    speedMilesPerHour: number
    reverseGeo: {
      formattedLocation: string
    }
    address?: {
      id: string
      name: string
    }
    isEcuSpeed: boolean
  }
}

export interface SamsaraResponse {
  data: SamsaraVehicleUI[]
  pagination: {
    endCursor: string
    hasNextPage: boolean
  }
}

export type SortOption = "fuelDesc" | "fuelAsc" | "nameAsc" | "nameDesc" | "fuelTimeDesc"
export type ViewMode = "card" | "list"
export type EngineFilter = "All" | "On" | "Off" | "Idle"
