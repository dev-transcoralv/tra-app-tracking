import { z } from "zod/v4";

export const PortSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const VehicleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ResponseListVehicleSchema = z.object({
  results: z.array(VehicleSchema),
});

// Driver
export const DriverSchema = z.object({
  id: z.number(),
  name: z.string(),
  vat: z.string(),
  street: z.string(),
  license_type: z.string(),
  expiration_date: z.string(),
  image_1920: z.string().nullable(),
  port_permit: z.array(PortSchema),
  assigned_plate: z.string().nullable(),
  assigned_plate_port_permit: z.array(PortSchema),
  push_token: z.string().nullable(),
});

// Response Login
export const ResponseLoginSchema = z.object({
  token: z.string(),
  employee: DriverSchema,
});

// Order
export const GeolocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const GuideSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(["own", "third"]),
  comment: z.string().optional(),
  image: z.string().optional(),
});

export const UbicationSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const GeocercaSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const MoveSchema = z.object({
  id: z.number().nullable(),
  order_id: z.number(),
  origin: UbicationSchema,
  destination: UbicationSchema,
  geocerca: GeocercaSchema,
  geocerca_destination: GeocercaSchema,
  date_in: z.string(),
  date_out: z.string(),
});

export const ObservationSchema = z.object({
  id: z.number(),
  name: z.string(),
  order_id: z.number(),
});

export const OrderSchema = z.object({
  id: z.number(),
  name: z.string(),
  trip_status: z.enum(["initiated", "finished"]).nullable(),
  business_name: z.string(),
  business_code: z.enum(["containers", "grain", "palletizing", "gas_fuel"]),
  type_delivery_note: z.enum(["customer", "own", "both"]),
  status_arrival: z.enum(["done", "blocked"]),
  coordinator_name: z.string(),
  coordinator_mobile: z.string().nullable(),
  route_name: z.string(),
  vehicle_name: z.string(),
  type_property: z.enum(["own", "third"]),
  chassis: VehicleSchema.nullable(),
  driver_assistant_name: z.string().nullable(),
  route_geolocation_origin: GeolocationSchema,
  route_geolocation_destination: GeolocationSchema,
  partner_name: z.string(),
  eta_charge: z.string(),
  eta_download: z.string(),
  arrival_point_charge_time: z.string().nullable(),
  arrival_charge_time: z.string().nullable(),
  departure_charge_time: z.string().nullable(),
  departure_point_charge_time: z.string().nullable(),
  arrival_point_download_time: z.string().nullable(),
  arrival_download_time: z.string().nullable(),
  departure_download_time: z.string().nullable(),
  departure_point_download_time: z.string().nullable(),
  start_of_trip: z.string().nullable(),
  start_of_trip_iso_format: z.string().nullable(),
  guides: z.array(GuideSchema),
  observations: z.array(ObservationSchema),
  moves: z.array(MoveSchema),
  goes_to_position_retirement: z.boolean(),
  container_workflow: z.enum(["1", "2", "3", "4"]).nullable(),
  container_type_operation: z
    .enum(["immediate loading", "position retirement"])
    .nullable(),
  container_type_operation_value: z.string().nullable(),
  container_type: z.enum(["import", "export"]).nullable(),
  container_type_value: z.string().nullable(),
  port_name: z.string(),
  kind_container_name: z.string(),
  retreat_yard_name: z.string().nullable(),
  chassis_type: z.string(),
  turn_date: z.string().nullable(),
  arrival_empty_time: z.string().nullable(),
  departure_empty_time: z.string().nullable(),
  image_container: z.string().nullable(),
  has_generator: z.boolean().default(false),
  generator_supplier_name: z.string().nullable(),
  generator_supplier_removal: z.string().nullable(),
  generator_supplier_delivery: z.string().nullable(),
  container: z.string().nullable(),
  operation_name: z.string(),
  material_name: z.string(),
  burden_kg: z.number(),
  tara_kg: z.number(),
  final_burden_kg: z.number(),
  final_tara_kg: z.number(),
  image_scale_ticket: z.string().nullable(),
  final_image_scale_ticket: z.string().nullable(),
  sacks_information: z.string().nullable(),
});

// Response List Order
export const ResponseListOrderSchema = z.object({
  total: z.number(),
  results: z.array(OrderSchema),
});

export const GrainOperationSchema = z.object({
  id: z.number(),
  name: z.string(),
  partner_name: z.string(),
  ship_name: z.string(),
  recipient_name: z.string(),
  vehicle_name: z.string(),
  type_property: z.enum(["own", "third"]),
  supplier_name: z.string().nullable(),
  material_name: z.string(),
  operation_name: z.string(),
});

// Response List Grain Operation
export const ResponseListGrainOperationSchema = z.object({
  total: z.number(),
  results: z.array(GrainOperationSchema),
});

export const DashboardSchema = z.object({
  pending_trips: z.number(),
  finished_trips: z.number(),
  kilometers_traveled: z.number(),
  handling_time: z.string(),
  trip_in_progress: OrderSchema.nullable(),
  road_trips: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ),
});

// Leave
export const LeaveTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const LeaveSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  create_date: z.string(),
  holiday_status: LeaveTypeSchema,
  request_date_from: z.string(),
  request_date_to: z.string(),
  state: z.enum(["confirm", "refuse", "validate1", "validate"]),
  image: z.string().nullable(),
});

export const ResponseListLeaveTypeSchema = z.object({
  results: z.array(LeaveTypeSchema),
});

export const ResponseListLeaveSchema = z.object({
  total: z.number(),
  results: z.array(LeaveSchema),
});

export const ResponseListUbicationSchema = z.object({
  results: z.array(UbicationSchema),
});

export const ResponseListGeocercaSchema = z.object({
  results: z.array(GeocercaSchema),
});

export type Driver = z.infer<typeof DriverSchema>;
export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type GrainOperation = z.infer<typeof GrainOperationSchema>;
export type Geolocation = z.infer<typeof GeolocationSchema>;
export type ResponseListOrder = z.infer<typeof ResponseListOrderSchema>;
export type ResponseListGrainOperation = z.infer<
  typeof ResponseListGrainOperationSchema
>;
export type Guide = z.infer<typeof GuideSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
export type LeaveType = z.infer<typeof LeaveTypeSchema>;
export type Leave = z.infer<typeof LeaveSchema>;
export type ResponseListLeaveType = z.infer<typeof ResponseListLeaveTypeSchema>;
export type ResponseListLeave = z.infer<typeof ResponseListLeaveSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type ResponseListVehicle = z.infer<typeof ResponseListVehicleSchema>;
export type Ubication = z.infer<typeof UbicationSchema>;
export type Geocerca = z.infer<typeof GeocercaSchema>;
export type ResponseListUbication = z.infer<typeof ResponseListUbicationSchema>;
export type ResponseListGeocerca = z.infer<typeof ResponseListGeocercaSchema>;
