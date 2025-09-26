import { Move } from "../../shared.types";

type FormData = {
  id: number | null;
  origin_id: number | null;
};

export async function createOrUpdateMove(
  data: FormData,
  order_id: number,
): Promise<Move> {
  const payload = { ...data, ...{ order_id: order_id } };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/moves`;
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
      return json as Move;
    }
  } catch (error) {
    throw error;
  }
}

export async function deleteMove(id: number): Promise<string> {
  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/moves/${id}`;
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
