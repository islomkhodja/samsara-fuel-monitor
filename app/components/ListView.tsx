import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import React from "react";
import {VehicleListRow} from "@/app/components/VehicleListRow";
import {SamsaraVehicleUI} from "@/app/types";

export const ListView = ({vehicles}: { vehicles: SamsaraVehicleUI[] }) => (
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
          <VehicleListRow key={vehicle.id} vehicle={vehicle}/>
        ))}
      </TableBody>
    </Table>
  </div>
)
