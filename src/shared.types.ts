import { z } from "zod/v4";

// Driver
export const DriverSchema = z.object({
  id: z.number(),
  name: z.string(),
  vat: z.string(),
  street: z.string(),
  license_type: z.string(),
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

export const OrderSchema = z.object({
  id: z.number(),
  name: z.string(),
  trip_status: z.enum(["initiated", "finished"]).nullable(),
  service_code: z.string(),
  coordinator_name: z.string(),
  route_name: z.string(),
  vehicle_name: z.string(),
  route_geolocation_origin: GeolocationSchema,
  route_geolocation_destination: GeolocationSchema,
  partner_name: z.string(),
  eta_charge: z.string(),
  arrival_charge_time: z.string().nullable(),
  departure_charge_time: z.string().nullable(),
  arrival_download_time: z.string().nullable(),
  departure_download_time: z.string().nullable(),
  guides: z.array(GuideSchema),
  child_business_code: z
    .enum(["containers_import_immediate_loading"])
    .nullable(),
  port_name: z.string(),
  kind_container_name: z.string(),
  chassis_type: z.string(),
});

// Response List Order
export const ResponseListOrderSchema = z.object({
  total: z.number(),
  results: z.array(OrderSchema),
});

// Dashboard
const roadTripsSchema = z.object({
  route: z.string(),
  count: z.number(),
});

export const DashboardSchema = z.object({
  pending_trips: z.number(),
  finished_trips: z.number(),
  kilometers_traveled: z.number(),
  hours_worked: z.string(),
  trip_in_progress: OrderSchema.nullable(),
  road_trips: z.array(roadTripsSchema),
});

export type Driver = z.infer<typeof DriverSchema>;
export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Geolocation = z.infer<typeof GeolocationSchema>;
export type ResponseListOrder = z.infer<typeof ResponseListOrderSchema>;
export type Guide = z.infer<typeof GuideSchema>;
