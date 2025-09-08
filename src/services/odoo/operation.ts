import { Order, ResponseListGrainOperation } from "./../../shared.types";

interface Props {
  driverId: number | undefined;
  page: number;
  state: string;
}

export async function getListGrainOperations({
  page,
  driverId,
  state,
}: Props): Promise<ResponseListGrainOperation> {
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/grain_operations?page=${page}&employee_id=${driverId}&state=${state}`;
  try {
    const response = await fetch(URL);
    const json = await response.json();
    return json as ResponseListGrainOperation;
  } catch (error) {
    // Throw error
    throw error;
  }
}

export async function processGrainOperation(id: number | null): Promise<Order> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation_id: id,
    }),
  };
  const URL = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/grain_operations/process`;
  try {
    const response = await fetch(URL, options);
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    }
    return json as Order;
  } catch (error) {
    // Throw error
    throw error;
  }
}
