import { Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SamsaraVehicleUI } from "@/app/types"
import { useFormat } from "@/app/hooks/use-format"

interface VehicleTableProps {
  vehicles: SamsaraVehicleUI[]
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const { formatTime, getEngineStateVariant } = useFormat()

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Engine</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Fuel</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className={cn((vehicle.fuelPercent?.value || 0) < 20 ? "bg-red-50" : "")}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-slate-600" />
                  <span>{vehicle.name}</span>
                </div>
                {vehicle.externalIds?.["samsara.vin"] && (
                  <div className="text-xs text-muted-foreground mt-1">VIN: {vehicle.externalIds["samsara.vin"]}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getEngineStateVariant(vehicle.engineState.value)}>{vehicle.engineState.value}</Badge>
              </TableCell>
              <TableCell>
                <div className="truncate max-w-[200px]">{vehicle.gps.reverseGeo.formattedLocation}</div>
                {vehicle.gps.speedMilesPerHour > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(vehicle.gps.speedMilesPerHour)} mph
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={(vehicle.fuelPercent?.value || 0) < 20 ? "text-red-600 font-bold" : ""}>
                    {vehicle.fuelPercent?.value || 0}%
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${(vehicle.fuelPercent?.value || 0) < 20 ? "bg-red-600" : "bg-green-600"}`}
                      style={{ width: `${vehicle.fuelPercent?.value || 0}%` }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatTime(vehicle.gps.time)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

