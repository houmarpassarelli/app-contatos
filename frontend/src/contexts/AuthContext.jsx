import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [token, setToken] = useState(localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token

  async function login(credentials) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', credentials)
      setUser(data.user)
      setToken(data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('auth_token', data.access_token)
      return data
    } finally {
      setLoading(false)
    }
  }

  async function register(userData) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', userData)
      setUser(data.user)
      setToken(data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('auth_token', data.access_token)
      return data
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error(err)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
