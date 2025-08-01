import { Order, ResponseListOrder } from "./../../shared.types";

interface Props {
  driverId: number | undefined;
  page: number;
}

export async function getListOrders({
  page,
  driverId,
}: Props): Promise<ResponseListOrder> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders?page=${page}&employee_id=${driverId}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    const data = (json as { data: any }).data;
    return data as ResponseListOrder;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function getOrder(id: number): Promise<Order> {
  console.log(`Orden Id: ${id}`);
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    const data = (json as { data: any }).data;
    const result = data.result;
    return result as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}
