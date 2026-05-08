import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1'
const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
const csrfBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '')
const shouldUseSanctumCookieAuth = import.meta.env.VITE_USE_SANCTUM_COOKIE_AUTH === 'true'

let csrfRequest: Promise<unknown> | null = null

const isStateChangingMethod = (method?: string) => {
  const normalizedMethod = method?.toUpperCase()

  return (
    normalizedMethod === 'POST' ||
    normalizedMethod === 'PUT' ||
    normalizedMethod === 'PATCH' ||
    normalizedMethod === 'DELETE'
  )
}

const ensureCsrfCookie = async () => {
  if (!shouldUseSanctumCookieAuth) {
    return
  }

  if (csrfRequest) {
    await csrfRequest
    return
  }

  csrfRequest = axios.get(`${csrfBaseUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      Accept: 'application/json',
    },
  })

  try {
    await csrfRequest
  } finally {
    csrfRequest = null
  }
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isCsrfRequest = config.url?.includes('/sanctum/csrf-cookie') ?? false
  const hasBearerToken = Boolean(config.headers.Authorization ?? api.defaults.headers.common.Authorization)
  const isSameOriginRequest = config.baseURL?.startsWith(appUrl) ?? false

  if (!isCsrfRequest && isStateChangingMethod(config.method) && shouldUseSanctumCookieAuth && !hasBearerToken && !isSameOriginRequest) {
    await ensureCsrfCookie()
  }

  return config
})

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) => {
  const response = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>)?.response
  const firstError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : null

  return firstError ?? response?.data?.message ?? fallback
}
