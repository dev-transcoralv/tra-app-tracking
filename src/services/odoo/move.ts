import { Move } from "../../shared.types";

type FormData = {
  id: number | null;
  origin_id: number | null;
  destination_id: number | null;
  geocerca_id: number | null;
  geocerca_destination_id: number | null;
  date_in: Date;
  date_out: Date;
};

function isoToNaiveDatetime(isoString: string) {
  const date = new Date(isoString);
  const pad = (num: number) => String(num).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  );
}

export async function createOrUpdateMove(
  data: FormData,
  order_id: number,
): Promise<Move> {
  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/moves`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: order_id,
      id: data.id,
      origin_id: data.origin_id,
      destination_id: data.destination_id,
      geocerca_id: data.geocerca_id,
      geocerca_destination_id: data.geocerca_destination_id,
      date_in: isoToNaiveDatetime(data.date_in?.toISOString()),
      date_out: isoToNaiveDatetime(data.date_out?.toISOString()),
    }),
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
