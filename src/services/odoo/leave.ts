import { ResponseListLeaveType, ResponseListLeave } from "./../../shared.types";

interface Props {
  driverId: number | undefined;
  page: number;
  state: string;
}

export async function getListLeaveTypes(): Promise<ResponseListLeaveType> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/holidays/leave_types`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    return json as ResponseListLeaveType;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function getListLeaves({
  page,
  driverId,
  state,
}: Props): Promise<ResponseListLeave> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/holidays/leaves?page=${page}&employee_id=${driverId}&state=${state}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    return json as ResponseListLeave;
  } catch (error) {
    // Throw error
    throw error;
  }
}
