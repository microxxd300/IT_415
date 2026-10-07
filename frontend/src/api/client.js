// Talks to the FastAPI backend. Every failure becomes an ApiError whose message can be shown to the customer.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status // 0 = the server could not be reached
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new ApiError('Cannot reach the server. Please ask staff for help.', 0)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.detail ?? `Request failed (error ${response.status}).`, response.status)
  }
  return body
}

export function getProducts() {
  return request('/api/products')
}

export function createTransaction(payload) {
  return request('/api/transactions', { method: 'POST', body: JSON.stringify(payload) })
}

export function getTransaction(reference) {
  return request(`/api/transactions/${encodeURIComponent(reference)}`)
}
