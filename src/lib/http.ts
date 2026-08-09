/** Browser-side JSON helpers. Every mutation goes through these so failures surface a real message. */

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

async function readPayload(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function requestJson<T = unknown>(
  url: string,
  init: { method: "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown }
): Promise<T> {
  const response = await fetch(url, {
    method: init.method,
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}
