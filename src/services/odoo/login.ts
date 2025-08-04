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
    const json = await response.json();
    if (!response.ok) {
      const error = (json as { error: string }).error;
      throw error;
    } else {
      return json as ResponseLogin;
    }
  } catch (error) {
    // Throw error
    throw error;
  }
}
