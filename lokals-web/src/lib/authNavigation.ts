import type { NavigateFunction } from 'react-router-dom'

export const getCurrentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

export function navigateToLogin(
  navigate: NavigateFunction,
  options?: { from?: string; prompt?: string },
) {
  navigate('/login', {
    state: {
      from: options?.from ?? getCurrentPath(),
      prompt: options?.prompt ?? 'Sign in to continue',
    },
  })
}
