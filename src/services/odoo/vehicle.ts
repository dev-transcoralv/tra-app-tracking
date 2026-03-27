import { ResponseListVehicle } from "../../shared.types";

export async function getListChassis(
  businessCode = "all",
): Promise<ResponseListVehicle> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/vehicles/chassis?business_code=${businessCode}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    }
    return json as ResponseListVehicle;
  } catch (error) {
    // Throw error
    throw error;
  }
}
