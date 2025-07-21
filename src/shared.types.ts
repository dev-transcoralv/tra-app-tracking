import { z } from "zod/v4";
// Driver

export const DriverSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Driver = z.infer<typeof DriverSchema>;

// Order
export const OrderSchema = z.object({
  id: z.number(),
  name: z.string(),
  service_code: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
