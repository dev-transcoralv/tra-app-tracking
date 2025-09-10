import { Guide } from "../../shared.types";

type FormData = {
  id: number | null;
  type: "own" | "third";
  name: string;
  comment: string;
  image: string;
};

export async function createOrUpdateGuide(
  orderId: number,
  data: FormData,
): Promise<Guide> {
  const payload = {
    id: data.id,
    name: data.name,
    comment: data.comment,
    image: data.image,
    order_id: orderId,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/guides`;
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
      return json as Guide;
    }
  } catch (error) {
    throw error;
  }
}
