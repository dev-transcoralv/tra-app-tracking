import { Order, ResponseListOrder } from "./../../shared.types";

interface Props {
  driverId: number | undefined;
  page: number;
}

export async function getListOrders({
  page,
  driverId,
}: Props): Promise<ResponseListOrder> {
  console.log(`Call endpoint /tra/orders?page=${page}&employee_id=${driverId}`);
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders?page=${page}&employee_id=${driverId}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    return json as ResponseListOrder;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function getOrder(id: number): Promise<Order> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function startTrip(id: number): Promise<Order> {
  console.log(`Call endpoint /tra/orders/${id}/start_trip`);
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}/start_trip`;
  try {
    const response = await fetch(URL, options);
    const json = await response.json();
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}
