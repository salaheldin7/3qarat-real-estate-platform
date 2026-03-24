/**
 * Simple localStorage-based authentication
 * - Persists login even after browser closes
 * - Works across tabs
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

/**
 * Login - Store credentials in localStorage
 */
export function login(token: string, userData: any): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

/**
 * Logout - Clear session
 */
export function logout(broadcastToOtherTabs: boolean = true): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get user data
 */
export function getUser(): any | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Update user data
 */
export function updateUser(userData: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

/**
 * Setup cross-tab communication
 */
export function setupAuthSync(
  onLogin: () => void,
  onLogout: () => void
): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) {
      if (!e.newValue) {
        // Token was removed - logout
        onLogout();
      } else {
        // Token was added - login
        onLogin();
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Initialize session
 */
export function initializeSession(): void {
  // Nothing to do for localStorage
}

/**
 * Refresh session
 */
export function refreshSession(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
