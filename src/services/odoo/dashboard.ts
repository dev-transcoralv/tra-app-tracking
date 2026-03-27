import { Dashboard } from "../../shared.types";

export async function getDashboard(
  driverId: number | undefined,
  rangeDate: string,
): Promise<Dashboard> {
  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/dashboard?employee_id=${driverId}&range_date=${rangeDate}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    } else {
      return json as Dashboard;
    }
  } catch (error) {
    // Throw error
    throw error;
  }
}
