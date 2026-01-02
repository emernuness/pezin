import { MediaTokenPayload } from './types';

/**
 * Verify and decode a media access token
 * Token format: base64url(payload).base64url(signature)
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<MediaTokenPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadStr, signature] = parts;

  // Verify signature using Web Crypto API
  const expectedSignature = await sign(payloadStr, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  // Decode payload
  let payload: MediaTokenPayload;
  try {
    const decoded = atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/'));
    payload = JSON.parse(decoded);
  } catch {
    return null;
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }

  return payload;
}

/**
 * Create HMAC-SHA256 signature using Web Crypto API
 */
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // Convert to base64url
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
