import { Observation } from "../../shared.types";

export async function createOrUpdateObservation(
  id: number | null,
  name: string,
  order_id: number,
): Promise<Observation> {
  const payload = {
    id: id,
    name: name,
    order_id: order_id,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/observations`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    } else {
      return json as Observation;
    }
  } catch (error) {
    throw error;
  }
}

export async function deleteObservation(id: number): Promise<string> {
  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/observations/${id}`;
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    } else {
      const message = (json as { message: string }).message;
      return message;
    }
  } catch (error) {
    throw error;
  }
}
