import { Order } from "./../../shared.types";

export async function getListOrders(driverId: number): Promise<Order[]> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders?employee_id=${driverId}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    const { data } = json;
    // return OrderSchema.parse(data.results);
    return data.results;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function getOrder(id: number): Promise<Order> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/order/${id}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    const { data } = json;
    return data.result;
  } catch (error) {
    // Throw error
    throw error;
  }
}
