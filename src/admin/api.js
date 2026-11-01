export class ApiError extends Error {}
export class AuthExpired extends ApiError {}
export class Conflict extends ApiError {}

export class ValidationFailed extends ApiError {
  constructor(errors) {
    super(errors[0] ?? 'That could not be saved');
    this.errors = errors;
  }
}

const GENERIC = 'Something went wrong on the server. Your edits are still here';

export async function apiRequest(
  path,
  { method = 'GET', body, fetch = (...args) => globalThis.fetch(...args) } = {},
) {
  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      ...(body === undefined
        ? {}
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection. Your edits are still here');
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch { /* a proxy error page, for example */ }

  if (response.ok) return data;

  const message = data?.error ?? GENERIC;
  if (response.status === 401) throw new AuthExpired(message);
  if (response.status === 409) throw new Conflict(message);
  if (response.status === 400) throw new ValidationFailed(data?.errors ?? [message]);
  throw new ApiError(message);
}
