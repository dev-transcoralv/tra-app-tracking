import { Order, ResponseListOrder } from "./../../shared.types";

interface IndexProps {
  page: number;
  driverId?: string;
  status?: string;
  query?: string;
}

type BusinessGrainData = {
  burden_kg: number;
  tara_kg: number;
  final_burden_kg: number;
  final_tara_kg: number;
  image_scale_ticket: string | null;
  final_image_scale_ticket: string | null;
};

export async function getListOrders({
  page,
  driverId,
  status,
  query,
}: IndexProps): Promise<ResponseListOrder> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders?page=${page}&employee_id=${driverId}&status=${status}&query=${query}`;
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
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    }
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function stopTrip(id: number): Promise<Order> {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}/stop_trip`;
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

export async function updateBusinessGrain(
  id: number,
  data: BusinessGrainData,
): Promise<Order> {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/orders/${id}/update_business_grain`;
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
