import { z } from "zod/v4";

// Driver
export const DriverSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Response Login
export const ResponseLoginSchema = z.object({
  token: z.string(),
  employee: DriverSchema,
});

// Order
export const OrderSchema = z.object({
  id: z.number(),
  name: z.string(),
  service_code: z.string(),
  route_name: z.string(),
  partner_name: z.string(),
  eta_charge: z.string(),
});

// Response List Order
export const ResponseListOrderSchema = z.object({
  total: z.number(),
  results: z.array(OrderSchema),
});

export type Driver = z.infer<typeof DriverSchema>;
export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type ResponseListOrder = z.infer<typeof ResponseListOrderSchema>;
