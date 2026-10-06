/*
 * Small fetch wrapper for the Laravel API.
 * Paths are relative ("/api/..."): Vite proxies them to the backend in dev.
 *
 * Resolves with the parsed JSON body. Rejects with an Error carrying
 * `status` and the response `data` (Laravel's { message, errors }).
 */
export async function apiRequest(path, { token, method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Empty or non-JSON body (e.g. the dev proxy can't reach the backend).
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status}).`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/*
 * Laravel validation errors come as { field: ["message", ...] };
 * forms show one message per field.
 */
export function fieldErrors(apiErrors = {}) {
  return Object.fromEntries(
    Object.entries(apiErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : messages,
    ])
  );
}
