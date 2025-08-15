import { Order, ResponseListOrder } from "./../../shared.types";

interface Props {
  driverId: number | undefined;
  page: number;
  status: string;
}

export async function getListOrders({
  page,
  driverId,
  status,
}: Props): Promise<ResponseListOrder> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders?page=${page}&employee_id=${driverId}&status=${status}`;
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

export async function updateHours(id: number, field: string): Promise<Order> {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ field: field }),
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}/update_hours`;
  try {
    const response = await fetch(URL, options);
    const json = await response.json();
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function tripFinished(id: number): Promise<Order> {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}/trip_finished`;
  try {
    const response = await fetch(URL, options);
    const json = await response.json();
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}
