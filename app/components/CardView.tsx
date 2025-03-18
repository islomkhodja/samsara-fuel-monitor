import React from "react";
import {SamsaraVehicleUI} from "@/app/types";
import {VehicleCard} from "@/app/components/VehicleCard";

export const CardView = ({ vehicles }: { vehicles: SamsaraVehicleUI[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {vehicles.map((vehicle) => (
      <div key={vehicle.id} className="transition-all duration-300 transform hover:scale-105">
        <VehicleCard vehicle={vehicle} />
      </div>
    ))}
  </div>
)
