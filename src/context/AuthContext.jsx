import { createContext, useContext, useMemo, useState } from "react"
import { apiFetch } from "../lib/api"

const AuthContext = createContext(null)

const STORAGE_KEY = "bugtracker_auth"

const loadStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

export const AuthProvider = ({ children }) => {
  const stored = loadStored()
  const [token, setToken] = useState(stored.token)
  const [user, setUser] = useState(stored.user)

  const save = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  const clear = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const login = async ({ identifier, password }) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    })
    save(data.token, data.user)
    return data.user
  }

  const register = async ({ username, email, password }) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    })
    save(data.token, data.user)
    return data.user
  }

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout: clear
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
