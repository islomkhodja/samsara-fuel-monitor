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

export interface MotiveVehicle {
  vehicle: {
    id: number;
    number: string;
    year: string;
    make: string;
    model: string;
    vin: string;
    fuel_type: string;
    current_location?: {
      lat: number;
      lon: number;
      located_at: string;
      bearing: number;
      engine_hours: number;
      id: string;
      type: string;
      description: string;
      speed?: number;
      odometer: number;
      true_odometer: number;
      true_engine_hours: number;
      battery_voltage?: number;
      fuel?: number;
      fuel_primary_remaining_percentage?: number;
      fuel_secondary_remaining_percentage?: number;
      veh_range: any;
      hvb_state_of_charge: any;
      hvb_charge_status: any;
      hvb_charge_source: any;
      hvb_lifetime_energy_output: any;
    };
    current_driver: any;
  };
}

export interface MotiveResponse {
  vehicles: MotiveVehicle[];
  pagination: {
    per_page: number;
    page_no: number;
    total: number;
  };
}

export type SortOption = "fuelDesc" | "fuelAsc" | "nameAsc" | "nameDesc" | "fuelTimeDesc"
export type ViewMode = "card" | "list"
export type EngineFilter = "All" | "On" | "Off" | "Idle"
