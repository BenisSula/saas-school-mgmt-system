/**
 * CSRF protection for frontend
 */

import { getCsrfToken } from './tokenSecurity';

/**
 * Get CSRF token from cookie and add to request headers
 */
export function getCsrfHeader(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) {
    return {};
  }
  return {
    'x-csrf-token': token
  };
}

/**
 * Enhanced fetch with CSRF protection
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfHeaders = getCsrfHeader();
  
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...csrfHeaders,
      ...options.headers,
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Include cookies for CSRF token
  };
  
  return fetch(url, enhancedOptions);
}

