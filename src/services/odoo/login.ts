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
    console.log(response);
    const result = await response.json();

    if (!response.ok) {
      //
    } else {
      console.log(result.data);
    }
  } catch (error) {
    console.log(error);
  } finally {
  }
}
