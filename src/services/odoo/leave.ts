import {
  ResponseListLeaveType,
  ResponseListLeave,
  Leave,
} from "./../../shared.types";

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

export async function createOrUpdateLeave(
  employee_id: number | null | undefined,
  id: number | null | undefined,
  holiday_status_id: number | null,
  request_date_from: string,
  request_date_to: string,
  name: string,
  image: string | null,
): Promise<Leave> {
  const payload = {
    employee_id: employee_id,
    id: id,
    name: name,
    holiday_status_id: holiday_status_id,
    request_date_from: request_date_from,
    request_date_to: request_date_to,
    image: image,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/holidays/leave`;
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
      return json as Leave;
    }
  } catch (error) {
    throw error;
  }
}
