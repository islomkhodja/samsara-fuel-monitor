import type {SamsaraVehicleUI} from "@/app/types"
import {VehicleCard} from "./vehicle-card"

interface VehicleGridProps {
  vehicles: SamsaraVehicleUI[]
}

export function VehicleGrid({vehicles}: VehicleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle}/>
      ))}
    </div>
  )
}

