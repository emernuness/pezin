# Deployment Security Checklist

## Pre-Deployment Security Verification

Use this checklist before every production deployment to ensure all security measures are in place.

---

## ✅ Environment Configuration

### API Backend (.env)
- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is a cryptographically random 256-bit value (not default)
- [ ] `JWT_REFRESH_SECRET` is different from `JWT_SECRET`
- [ ] `MEDIA_TOKEN_SECRET` is a cryptographically random 256-bit value
- [ ] `STRIPE_SECRET_KEY` is production key (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` is configured for production webhook
- [ ] `DATABASE_URL` uses SSL mode (`?sslmode=require`)
- [ ] `R2_ACCESS_KEY` and `R2_SECRET_KEY` are production keys
- [ ] `WORKER_INTERNAL_API_KEY` is a strong random key
- [ ] `WEB_URL` points to production frontend domain (HTTPS)

### Frontend Web (.env.local)
- [ ] `NEXT_PUBLIC_API_URL` points to production API (HTTPS)
- [ ] No sensitive keys exposed with `NEXT_PUBLIC_` prefix

### Cloudflare Worker (Secrets)
- [ ] `wrangler secret put MEDIA_TOKEN_SECRET` matches API secret
- [ ] `wrangler secret put API_INTERNAL_KEY` matches API key
- [ ] `API_INTERNAL_URL` in wrangler.toml points to production API

---

## ✅ Infrastructure Security

### Database (PostgreSQL)
- [ ] SSL/TLS enabled for connections
- [ ] Database user has minimal privileges (no SUPERUSER)
- [ ] Password is strong and rotated regularly
- [ ] Automated backups configured (daily minimum)
- [ ] Backups stored in separate region/account
- [ ] Encryption at rest enabled
- [ ] Public access disabled (whitelist backend IPs only)

### Cloudflare R2 Storage
- [ ] Bucket is private (no public read)
- [ ] CORS configured for frontend domain only
- [ ] Lifecycle rules to delete expired presigned uploads (>24h)
- [ ] Versioning enabled for disaster recovery
- [ ] Access logs enabled

### Cloudflare CDN/Worker
- [ ] Custom domain configured with SSL
- [ ] DDoS protection enabled
- [ ] WAF rules configured:
  - [ ] Block known bad user agents
  - [ ] Rate limit aggressive clients (>100 req/min)
  - [ ] Geo-blocking (if applicable)
  - [ ] Challenge suspicious requests
- [ ] Bot management enabled

---

## ✅ Application Security

### API Endpoints
- [ ] All POST/PUT/PATCH/DELETE endpoints have CSRF protection
- [ ] All protected endpoints use `@UseGuards(JwtAuthGuard)`
- [ ] Creator-only endpoints use `@Roles('creator')`
- [ ] Rate limiting configured per endpoint type
- [ ] Input validation with Zod on all endpoints
- [ ] Error responses don't leak stack traces

### Authentication
- [ ] Email verification enabled (not bypassed in production)
- [ ] Password complexity enforced (min 8 chars, mixed case, numbers)
- [ ] Account lockout after 5 failed login attempts (TODO)
- [ ] Refresh token rotation working
- [ ] Session timeout configured (15 min for access token)

### File Uploads
- [ ] MIME type validation enforced
- [ ] Magic bytes validation enabled (TODO)
- [ ] File size limits enforced (100MB per file)
- [ ] Total pack size limited (500MB)
- [ ] Presigned URLs expire after 1 hour
- [ ] Upload confirmation validates ownership

### Payments (Stripe)
- [ ] Production API keys (not test keys)
- [ ] Webhook endpoint uses HTTPS only
- [ ] Webhook signature verification enabled
- [ ] Platform fee is 20% (verified in code)
- [ ] 14-day anti-fraud hold enforced
- [ ] Idempotency checks for webhook events

---

## ✅ Security Headers

### Next.js Frontend
- [ ] Content-Security-Policy configured
- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

### NestJS Backend
- [ ] CORS restricted to frontend domain only
- [ ] Helmet or custom security headers enabled
- [ ] JSON payloads limited to 10MB

### Cloudflare Worker
- [ ] CORS headers include only allowed origins
- [ ] HSTS header added
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

---

## ✅ Monitoring & Logging

### Application Logging
- [ ] Pino logger configured for production (no pretty-print)
- [ ] Sensitive data redacted from logs (passwords, tokens, CPF)
- [ ] Log level set to 'info' or 'warn' (not 'debug')
- [ ] Logs sent to centralized logging (Datadog, ELK, etc.)

### Error Tracking
- [ ] Sentry or similar error tracking configured
- [ ] Source maps uploaded for stack trace resolution
- [ ] Alerts configured for critical errors
- [ ] PII scrubbed before sending to Sentry

### Performance Monitoring
- [ ] APM tool configured (Datadog, New Relic, etc.)
- [ ] Database query performance tracked
- [ ] API endpoint response times monitored
- [ ] Alerting for slow endpoints (>2s)

### Security Monitoring
- [ ] Failed login attempts tracked
- [ ] CSRF token validation failures logged
- [ ] Rate limit violations logged
- [ ] Suspicious file upload attempts flagged
- [ ] Webhook signature failures alerted

---

## ✅ Compliance & Legal

### LGPD (Brazilian Data Protection Law)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Age verification (18+) enforced
- [ ] User data export endpoint functional (`/api/user/data`)
- [ ] Account deletion functional (`DELETE /api/user/account`)
- [ ] Data retention policy documented
- [ ] Cookie consent banner implemented (if using analytics)

### Financial Compliance
- [ ] Creator onboarding collects required tax info (CPF)
- [ ] Purchase records retained for 5 years
- [ ] Platform fee calculations auditable

---

## ✅ Deployment Process

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] Type checking passing (`pnpm typecheck`)
- [ ] Linting passing (`pnpm lint`)
- [ ] No console.log statements in production code
- [ ] Dependencies updated and audited (`pnpm audit`)

### Database Migrations
- [ ] Migrations tested in staging environment
- [ ] Rollback plan prepared
- [ ] Backup created before migration
- [ ] Downtime window communicated (if needed)

### Deployment Strategy
- [ ] Blue-green deployment or canary release
- [ ] Health check endpoint responding (`/health`)
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Rollback procedure tested

### Post-Deployment Verification
- [ ] Smoke tests passing
- [ ] Authentication flow working
- [ ] Payment flow working (test with small amount)
- [ ] File upload/download working
- [ ] No spike in error rates
- [ ] Response times within SLA

---

## ✅ Incident Response Readiness

### Documentation
- [ ] Runbook for common issues
- [ ] Incident response plan documented
- [ ] On-call rotation scheduled
- [ ] Contact list updated (Stripe, Cloudflare support, etc.)

### Access & Credentials
- [ ] Emergency access credentials stored securely
- [ ] 2FA enabled on all admin accounts
- [ ] API keys rotated within last 90 days
- [ ] Backup maintainer has access

### Monitoring & Alerts
- [ ] PagerDuty or on-call system configured
- [ ] Alert thresholds tuned (avoid false positives)
- [ ] Slack/Discord integration for alerts
- [ ] Status page configured for users

---

## 🚨 Critical Security Issues - DO NOT DEPLOY IF:

- [ ] Default JWT secrets are still in use
- [ ] Test Stripe keys in production
- [ ] Database is publicly accessible
- [ ] CORS allows all origins (`*`)
- [ ] File uploads have no validation
- [ ] Error stack traces visible to users
- [ ] No rate limiting configured
- [ ] Email verification disabled

---

## 📝 Deployment Sign-Off

**Deployed By:** ___________________________  
**Date:** ___________________________  
**Version/Tag:** ___________________________  
**Environment:** [ ] Production [ ] Staging  

**Checklist Completed:** [ ] Yes [ ] No  

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Security Review Approved By:** ___________________________  
**Date:** ___________________________

---

## 🔄 Post-Deployment Actions (within 24h)

- [ ] Verify all security headers in production
- [ ] Test CSRF protection on live endpoints
- [ ] Review logs for any errors or warnings
- [ ] Confirm monitoring/alerting working
- [ ] Update status page (if deployment had issues)
- [ ] Schedule post-mortem (if incident occurred)

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-01-02  
**Next Review:** 2026-04-02 (quarterly)
