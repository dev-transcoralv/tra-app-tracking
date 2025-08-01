import { ResponseLogin } from "../../shared.types";

export async function odooLogin(
  username: string,
  password: string,
): Promise<ResponseLogin> {
  const payload = {
    username: username,
    password: password,
  };

  const url = `${process.env.EXPO_PUBLIC_ODOO_URL}/tra/login`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);
    console.log(`Login with Response ${response.ok}`);
    const json = await response.json();
    const result = (json as { result: any }).result;
    if (!response.ok) {
      throw result;
    } else {
      const data = (result as { data: any }).data;
      return data as ResponseLogin;
    }
  } catch (error) {
    // Throw error
    throw error;
  }
}
