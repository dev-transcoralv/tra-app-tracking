import { Guide } from "../../shared.types";

export async function createOrUpdateGuide(
  orderId: number,
  guideId: number | null | undefined,
  name: string,
  comment?: string,
  image?: string | null,
): Promise<Guide> {
  const payload = {
    id: guideId,
    name: name,
    comment: comment,
    image: image,
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
