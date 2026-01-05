/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/app/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/app/signup",
        permanent: true,
      },
      {
        source: "/cadastro",
        destination: "/app/signup",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/app/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/app/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/explore",
        destination: "/app/explore",
        permanent: true,
      },
      {
        source: "/me/:path*",
        destination: "/app/me/:path*",
        permanent: true,
      },
      {
        source: "/pack/:path*",
        destination: "/app/pack/:path*",
        permanent: true,
      },
      {
        source: "/c/:path*",
        destination: "/app/c/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: http://localhost:* blob:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:3001 http://localhost:8787 https://*.r2.cloudflarestorage.com",
              "frame-src 'self'",
              "media-src 'self' http://localhost:* https://*.r2.cloudflarestorage.com blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
