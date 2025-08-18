import { Driver } from "../../shared.types";

export async function updatePushToken(
  driverId: number,
  token: string,
): Promise<Driver> {
  const payload = {
    push_token: token,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/employees/${driverId}`;
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
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    } else {
      return json as Driver;
    }
  } catch (error) {
    throw error;
  }
}
