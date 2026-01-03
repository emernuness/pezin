# CSRF Protection Integration Guide

## Overview

This application uses **Double Submit Cookie** pattern for CSRF protection. This prevents Cross-Site Request Forgery attacks without requiring server-side session storage.

## How It Works

1. **Server** sets a CSRF token in a cookie (`XSRF-TOKEN`) that JavaScript can read
2. **Client** reads the cookie and sends the same token in the `X-CSRF-Token` header
3. **Server** validates that both match before processing state-changing requests

## Backend Implementation ✅

The backend already has:
- `CsrfGuard` implemented (`apps/api/src/common/guards/csrf.guard.ts`)
- `/auth/csrf-token` endpoint to generate tokens
- Token validation on state-changing methods (POST, PUT, PATCH, DELETE)

## Frontend Integration Required

### 1. Fetch CSRF Token on App Load

Add to your app initialization (e.g., `apps/web/src/app/layout.tsx` or auth store):

```typescript
// apps/web/src/services/csrf.ts
import { api } from './api';

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  try {
    const response = await api.get('/auth/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
}
```

### 2. Update Axios Interceptor

Modify `apps/web/src/services/api.ts` to include the CSRF token:

```typescript
import { getCsrfToken, clearCsrfToken } from './csrf';

// ... existing code ...

// Add CSRF token to requests
api.interceptors.request.use(async (config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
    try {
      const token = await getCsrfToken();
      config.headers['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('CSRF token fetch failed, request may be rejected');
    }
  }

  return config;
});

// Clear token on 403 CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ... existing error handling ...

    // If CSRF validation failed, clear and retry
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      clearCsrfToken();
      // Optionally retry the request
      const originalRequest = error.config;
      if (!originalRequest._csrfRetry) {
        originalRequest._csrfRetry = true;
        const token = await getCsrfToken();
        originalRequest.headers['X-CSRF-Token'] = token;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
```

### 3. Initialize on App Mount

In your root layout or `_app.tsx`:

```typescript
import { getCsrfToken } from '@/services/csrf';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Fetch CSRF token on app load
    getCsrfToken().catch(console.error);
  }, []);

  return <>{children}</>;
}
```

### 4. Refresh Token on Login

Update `auth.store.ts`:

```typescript
import { getCsrfToken, clearCsrfToken } from '@/services/csrf';

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing code ...

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, accessToken } = response.data;
    
    // Refresh CSRF token after login
    clearCsrfToken();
    await getCsrfToken();
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_attempted', 'true');
    }
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    
    // Clear CSRF token on logout
    clearCsrfToken();
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_attempted');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
```

## Testing

### Manual Testing

1. **Open DevTools** → Application → Cookies
2. **Verify** `XSRF-TOKEN` cookie is set after page load
3. **Make a POST request** (e.g., login)
4. **Check Network tab** → Request Headers → `X-CSRF-Token` should be present
5. **Verify** request succeeds (200 status)

### Test CSRF Protection

Try making a request WITHOUT the token:

```bash
# This should fail with 403 Forbidden
curl -X POST https://api.packdopezin.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  --cookie "XSRF-TOKEN=invalid"
```

### Test with Valid Token

```bash
# Get token first
TOKEN=$(curl -s https://api.packdopezin.com/auth/csrf-token | jq -r '.csrfToken')

# Use token in request
curl -X POST https://api.packdopezin.com/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  --cookie "XSRF-TOKEN=$TOKEN"
```

## Security Considerations

### Why This is Secure

1. **Same-Origin Policy**: Attacker's site cannot read our cookies
2. **No Custom Header in Forms**: HTML forms cannot set custom headers
3. **Double Verification**: Both cookie and header must match
4. **SameSite Cookie**: Additional layer preventing cross-site sending

### Attack Scenario (Prevented)

```html
<!-- Attacker's malicious site (evil.com) -->
<form action="https://packdopezin.com/stripe/checkout" method="POST">
  <input type="hidden" name="packId" value="attacker-pack">
  <input type="submit" value="Click for free prize!">
</form>
```

**Why it fails:**
- Browser sends the `XSRF-TOKEN` cookie (if user is logged in)
- But form cannot set `X-CSRF-Token` header
- Server sees cookie but no header → 403 Forbidden

## Troubleshooting

### "CSRF token missing" Error

**Cause:** Token not fetched or not sent in header

**Fix:** Ensure `getCsrfToken()` is called before making requests

### "CSRF token invalid" Error

**Cause:** Cookie and header don't match

**Fix:** 
1. Clear browser cookies
2. Restart app
3. Check for CORS issues (cookie not being sent)

### Token Not Refreshing

**Cause:** Token cached after logout

**Fix:** Call `clearCsrfToken()` on logout/session timeout

## Production Checklist

- [ ] CSRF token fetched on app initialization
- [ ] Token included in all POST/PUT/PATCH/DELETE requests
- [ ] Token refreshed after login
- [ ] Token cleared on logout
- [ ] Error handling for token fetch failures
- [ ] Retry logic for 403 CSRF errors
- [ ] Cookies working in production (check SameSite, Domain)
- [ ] HTTPS enforced (required for Secure cookies)

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
