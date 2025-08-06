import { Guide } from "../../shared.types";

export async function updateGuide(
  guideId: number,
  comment?: string,
  image?: string | null,
): Promise<Guide> {
  console.log(`Call endpoint /tra/guides/${guideId}`);
  const payload = {
    comment: comment,
    image: image,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/guides/${guideId}`;
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    console.log(
      `JSON from Call endpoint /tra/guides/${guideId}: ${JSON.stringify(json, null, 2)}`,
    );
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
