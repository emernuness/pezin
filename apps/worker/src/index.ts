import { Env, ResolvePathResponse } from './types';
import { verifyToken } from './token';

// CORS headers for allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://packdopezin.com',
  'https://www.packdopezin.com',
];

function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // Only handle GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Handle /media/{token} requests
    if (url.pathname.startsWith('/media/')) {
      return handleMediaRequest(request, env, origin);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleMediaRequest(
  request: Request,
  env: Env,
  origin: string | null
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.pathname.replace('/media/', '');

  if (!token) {
    return new Response('Token required', {
      status: 400,
      headers: getCorsHeaders(origin),
    });
  }

  // Verify token
  const payload = await verifyToken(token, env.MEDIA_TOKEN_SECRET);
  if (!payload) {
    return new Response('Invalid or expired token', {
      status: 401,
      headers: getCorsHeaders(origin),
    });
  }

  // Resolve the actual R2 path from the backend
  let pathInfo: ResolvePathResponse;
  try {
    pathInfo = await resolveMediaPath(token, env);
  } catch (error) {
    console.error('Failed to resolve path:', error);
    return new Response('Failed to resolve media path', {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }

  // Fetch from R2
  const object = await env.R2_BUCKET.get(pathInfo.path);
  if (!object) {
    return new Response('File not found', {
      status: 404,
      headers: getCorsHeaders(origin),
    });
  }

  // Build response headers
  const headers: HeadersInit = {
    ...getCorsHeaders(origin),
    'Content-Type': pathInfo.contentType || 'application/octet-stream',
    'Cache-Control': 'private, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  };

  // Add Content-Disposition for downloads
  if (pathInfo.filename) {
    const sanitizedFilename = pathInfo.filename.replace(/[^\w.-]/g, '_');
    headers['Content-Disposition'] = `inline; filename="${sanitizedFilename}"`;
  }

  // Add content length if available
  if (object.size) {
    headers['Content-Length'] = object.size.toString();
  }

  return new Response(object.body, {
    status: 200,
    headers,
  });
}

/**
 * Call backend API to resolve the actual R2 path from token
 */
async function resolveMediaPath(
  token: string,
  env: Env
): Promise<ResolvePathResponse> {
  const response = await fetch(`${env.API_INTERNAL_URL}/internal/media/resolve-path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-API-Key': env.API_INTERNAL_KEY,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Backend returned ${response.status}: ${error}`);
  }

  return response.json();
}
