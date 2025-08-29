import { z } from "zod/v4";

export const PortSchema = z.object({
  id: z.number(),
  name: z.string(),
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
  comment: z.string().optional(),
  image: z.string().optional(),
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
  business_code: z.enum(["containers", "grain", "palletizing"]),
  status_arrival: z.enum(["done", "blocked"]),
  coordinator_name: z.string(),
  coordinator_mobile: z.string().nullable(),
  route_name: z.string(),
  vehicle_name: z.string(),
  chassis_name: z.string().nullable(),
  route_geolocation_origin: GeolocationSchema,
  route_geolocation_destination: GeolocationSchema,
  partner_name: z.string(),
  eta_charge: z.string(),
  arrival_charge_time: z.string().nullable(),
  departure_charge_time: z.string().nullable(),
  arrival_download_time: z.string().nullable(),
  departure_download_time: z.string().nullable(),
  start_of_trip: z.string().nullable(),
  start_of_trip_iso_format: z.string().nullable(),
  guides: z.array(GuideSchema),
  observations: z.array(ObservationSchema),
  child_business_code: z
    .enum(["containers_import_immediate_loading"])
    .nullable(),
  port_name: z.string(),
  kind_container_name: z.string(),
  chassis_type: z.string(),
  material_name: z.string(),
  burden_kg: z.number(),
  tara_kg: z.number(),
  final_burden_kg: z.number(),
  final_tara_kg: z.number(),
  sacks_information: z.string().nullable(),
});

// Response List Order
export const ResponseListOrderSchema = z.object({
  total: z.number(),
  results: z.array(OrderSchema),
});

export const DashboardSchema = z.object({
  pending_trips: z.number(),
  finished_trips: z.number(),
  kilometers_traveled: z.number(),
  handling_time: z.string(),
  trip_in_progress: OrderSchema.nullable(),
  road_trips: z.object({
    route: z.array(z.string()),
    count: z.array(z.number()),
  }),
});

export type Driver = z.infer<typeof DriverSchema>;
export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Geolocation = z.infer<typeof GeolocationSchema>;
export type ResponseListOrder = z.infer<typeof ResponseListOrderSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
