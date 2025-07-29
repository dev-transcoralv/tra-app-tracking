function validateData<T>(data: unknown): T {
  // aquí podrías usar zod, yup, io-ts, o validar manualmente
  return data as T; // ⚠️ unsafe cast si no validas
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data: unknown = await response.json();

  return validateData<T>(data);

export async function odooLogin(username: string, password: string) {
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
    const result = await response.json();
    if (!response.ok) {
      console.log(`Response 200 in Login: ${result.data}`);
    } else {
      console.log(`Response 200 in Login: ${result.data}`);
    }
  } catch (error) {
    console.log(`Error Login: ${error}`);
  } finally {
  }
}
