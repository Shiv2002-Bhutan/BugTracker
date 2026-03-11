const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

export const apiFetch = async (path, options = {}) => {
  const { token, headers, ...rest } = options

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  })

  let data = null
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  if (!res.ok) {
    const message = data?.error || data || `Request failed: ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}
