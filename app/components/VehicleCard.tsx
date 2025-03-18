import {Card, CardContent} from "@/components/ui/card";
import {Battery, Calendar, MapPin, Power, Truck} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import React from "react";
import {SamsaraVehicleUI} from "@/app/types";
import {formatTime, getEngineStateVariant} from "@/app/util";


export const VehicleCard = ({ vehicle }: { vehicle: SamsaraVehicleUI }) => (
  <Card className={`overflow-hidden ${(vehicle.fuelPercent?.value || 0) < 20 ? "bg-red-50" : ""}`}>
    <div className="relative h-12 bg-slate-100 flex items-center px-4">
      <Truck className="h-5 w-5 mr-2 text-slate-600" />
      <h2 className="text-lg font-semibold truncate">{vehicle.name}</h2>
      <Badge variant={getEngineStateVariant(vehicle.engineState.value)} className="ml-auto">
        {vehicle.engineState.value}
      </Badge>
    </div>
    <CardContent className="p-4">
      <div className="flex items-center mb-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
        <span className="truncate">{vehicle.gps.reverseGeo.formattedLocation}</span>
        {vehicle.gps.speedMilesPerHour > 0 && (
          <span className="ml-auto whitespace-nowrap">{Math.round(vehicle.gps.speedMilesPerHour)} mph</span>
        )}
      </div>
      <div className="flex items-center mb-3 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
        <span>Last updated: {formatTime(vehicle.gps.time)}</span>
      </div>
      {vehicle.externalIds?.["samsara.vin"] && (
        <div className="mb-3 text-sm text-muted-foreground">
          <span className="font-medium">VIN:</span> {vehicle.externalIds["samsara.vin"]}
        </div>
      )}
      <div className="flex items-center mb-3 text-sm text-muted-foreground">
        <Power className="h-4 w-4 mr-1 flex-shrink-0" />
        <span>Engine: {vehicle.engineState.value}</span>
        <span className="ml-2 text-xs">({formatTime(vehicle.engineState.time)})</span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="flex items-center">
            <Battery className="h-4 w-4 mr-1" />
            Fuel Level
          </span>
          <span className={(vehicle.fuelPercent?.value || 0) < 20 ? "text-red-600 font-bold" : ""}>
            {vehicle.fuelPercent?.value || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${(vehicle.fuelPercent?.value || 0) < 20 ? "bg-red-600" : "bg-green-600"}`}
            style={{ width: `${vehicle.fuelPercent?.value || 0}%` }}
          ></div>
        </div>
        {vehicle.fuelPercent && (
          <div className="text-xs text-right mt-1 text-muted-foreground">
            Updated: {formatTime(vehicle.fuelPercent.time)}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)
