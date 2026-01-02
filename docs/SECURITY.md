# Security Policy - Pack do Pezin

## 🔐 Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it to:

- **Email:** security@packdopezin.com
- **Response Time:** Within 48 hours
- **Disclosure Policy:** Coordinated disclosure (30-90 days)

**Do NOT:**
- Open public GitHub issues for security vulnerabilities
- Exploit the vulnerability beyond what is necessary to demonstrate it
- Access or modify user data without permission

**Rewards:**
- We offer a bug bounty program for eligible vulnerabilities
- Bounties range from $100 to $5,000 USD depending on severity

---

## 🛡️ Security Measures Implemented

### Authentication & Authorization
- ✅ **JWT with Refresh Token Rotation** - Access tokens expire in 15 minutes
- ✅ **HTTP-Only Cookies** - Refresh tokens stored securely, not accessible to JavaScript
- ✅ **Bcrypt with Salt** - Password hashing with cost factor 12
- ✅ **Rate Limiting** - 10 login attempts per minute, 5 signup attempts per minute
- ✅ **CSRF Protection** - Double Submit Cookie pattern (see implementation notes)
- ✅ **Session Invalidation** - Logout revokes refresh tokens immediately

### Input Validation
- ✅ **Zod Schema Validation** - All inputs validated on both frontend and backend
- ✅ **SQL Injection Prevention** - Using Prisma ORM with parameterized queries
- ✅ **XSS Prevention** - React automatically escapes output, CSP headers enforced
- ✅ **File Type Validation** - MIME type validation for uploads (magic bytes validation recommended)

### Data Protection
- ✅ **HTTPS Enforcement** - Strict-Transport-Security header, secure cookies
- ✅ **Data Encryption in Transit** - All connections over TLS 1.2+
- ✅ **PII Protection** - CPF, phone numbers stored with access controls
- ✅ **14-Day Anti-Fraud Hold** - Creator earnings held for 2 weeks
- ⚠️ **Data Encryption at Rest** - NOT YET IMPLEMENTED (roadmap item)

### Infrastructure Security
- ✅ **Security Headers** - CSP, X-Frame-Options, X-Content-Type-Options, etc.
- ✅ **CORS Configuration** - Whitelist of allowed origins
- ✅ **Webhook Signature Verification** - Stripe webhook signatures validated
- ✅ **Presigned URL Expiration** - Upload/download URLs expire after 1 hour
- ✅ **Token-Based Media Access** - Cloudflare Worker validates JWTs for file access
- ⚠️ **WAF (Web Application Firewall)** - NOT YET CONFIGURED (use Cloudflare WAF in production)

### Monitoring & Logging
- ✅ **Structured Logging** - Using Pino for JSON logs
- ✅ **Audit Trails** - All purchases, uploads, downloads logged
- ✅ **Idempotent Webhooks** - Stripe events tracked to prevent duplicates
- ⚠️ **Centralized Logging** - NOT YET IMPLEMENTED (use Datadog/ELK in production)
- ⚠️ **Security Alerts** - NOT YET IMPLEMENTED (configure alerting)

---

## 🔒 Secure Configuration Checklist

### Before Deploying to Production

#### Environment Variables
- [ ] Change all default secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `MEDIA_TOKEN_SECRET`)
- [ ] Use cryptographically secure random values (min 256 bits)
- [ ] Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Never commit `.env` files to git
- [ ] Rotate secrets every 90 days

#### Database
- [ ] Enable SSL/TLS for database connections
- [ ] Use least-privilege database user (no SUPERUSER)
- [ ] Regular automated backups
- [ ] Encrypt backups at rest
- [ ] Enable audit logging

#### Stripe
- [ ] Use production Stripe keys (not test keys)
- [ ] Configure webhook endpoint with HTTPS only
- [ ] Set up Radar for fraud detection
- [ ] Enable 3D Secure for high-risk transactions
- [ ] Review payout schedule (14-day hold is configured)

#### Cloudflare R2
- [ ] Bucket ACLs set to private
- [ ] Presigned URLs only (no public access)
- [ ] CORS configured for frontend domain only
- [ ] Enable versioning for disaster recovery
- [ ] Set up lifecycle rules to delete temp files

#### Next.js Frontend
- [ ] Set `NODE_ENV=production`
- [ ] Enable CSP headers (already configured)
- [ ] Configure allowed domains in CSP `connect-src`
- [ ] Disable React DevTools in production builds
- [ ] Use `next build` (optimized build)

#### NestJS Backend
- [ ] Set `NODE_ENV=production`
- [ ] Disable CORS for untrusted origins
- [ ] Configure rate limiting globally
- [ ] Enable Helmet for security headers (or custom headers)
- [ ] Set up health check endpoint monitoring

#### Cloudflare Worker
- [ ] Set production secrets via `wrangler secret put`
- [ ] Enable R2 bucket binding
- [ ] Configure custom domain with HTTPS
- [ ] Set up error alerts
- [ ] Monitor usage limits

---

## 🚨 Common Attack Vectors & Mitigations

### SQL Injection
**Risk:** ✅ LOW  
**Mitigation:** Using Prisma ORM with parameterized queries. No raw SQL in application code.  
**Exception:** Health check uses `$queryRaw` but with static query (no user input).

### Cross-Site Scripting (XSS)
**Risk:** ✅ LOW  
**Mitigation:**
- React automatically escapes JSX output
- CSP headers prevent inline script execution
- User-generated content (bio, pack description) is not rendered as HTML
- `dangerouslySetInnerHTML` only used for JSON-LD schema (trusted content)

### Cross-Site Request Forgery (CSRF)
**Risk:** ⚠️ MEDIUM (being addressed)  
**Mitigation:**
- CSRF Guard implemented using Double Submit Cookie pattern
- SameSite=strict cookies prevent cross-site requests
- Requires integration with frontend to send X-CSRF-Token header

### Insecure Direct Object References (IDOR)
**Risk:** ✅ LOW  
**Mitigation:**
- All pack operations verify `creatorId === user.id`
- File downloads require purchase validation
- User can only access their own purchases

### File Upload Attacks
**Risk:** ⚠️ MEDIUM  
**Mitigation:**
- MIME type validation enforced
- **TODO:** Magic bytes validation to prevent MIME type spoofing
- Files uploaded directly to R2 (not through backend)
- Size limits enforced (100MB per file, 500MB per pack)
- Presigned URLs expire after 1 hour

### Credential Stuffing
**Risk:** ✅ LOW  
**Mitigation:**
- Rate limiting on `/auth/login` (10 req/min)
- Account lockout after 5 failed attempts (TODO)
- Email verification required (in production)
- Strong password requirements (min 8 chars, uppercase, lowercase, number)

### Man-in-the-Middle (MITM)
**Risk:** ✅ LOW  
**Mitigation:**
- HTTPS enforced via HSTS header
- Secure cookies always set
- Certificate pinning (TODO for mobile apps)

### Denial of Service (DoS)
**Risk:** ⚠️ MEDIUM  
**Mitigation:**
- Rate limiting on API endpoints (100 req/min global, 10 req/min on auth)
- Cloudflare CDN provides DDoS protection
- **TODO:** Configure Cloudflare WAF rules
- **TODO:** Implement application-level circuit breakers

---

## 📋 Incident Response Plan

### 1. Detection
- Monitor for abnormal traffic patterns
- Alert on multiple failed login attempts
- Track Stripe webhook failures
- Log all security-relevant events

### 2. Triage
**Severity Levels:**
- **P0 (Critical):** Data breach, payment fraud, complete outage
- **P1 (High):** Account takeover, XSS exploit, partial outage
- **P2 (Medium):** Rate limit bypass, information disclosure
- **P3 (Low):** Cosmetic issues, non-exploitable bugs

**Response Times:**
- P0: Immediate (< 15 minutes)
- P1: Within 1 hour
- P2: Within 4 hours
- P3: Within 24 hours

### 3. Containment
For data breaches:
1. Revoke all active sessions (delete refresh tokens)
2. Force password reset for affected users
3. Disable compromised endpoints if needed
4. Contact Stripe to halt payouts if fraud detected

### 4. Eradication
- Deploy hotfix to close vulnerability
- Review all similar code patterns
- Update dependencies if vulnerability in library

### 5. Recovery
- Restore from backups if data corrupted
- Verify integrity of restored data
- Gradually restore service (canary deployments)

### 6. Post-Incident
- Write post-mortem report
- Update security policies
- Conduct security training
- Notify affected users (LGPD compliance)

---

## 🔐 LGPD Compliance

### Data Collected
- **User Data:** Email, password hash, birthdate, display name, bio
- **Creator Data:** Full name, CPF, phone, address (required for Stripe)
- **Purchase Data:** Amount, payment intent ID, creator earnings
- **Download Logs:** User ID, file ID, IP address, user agent

### User Rights
- **Right to Access:** Export all user data via `/api/user/data`
- **Right to Deletion:** Soft delete via `/api/user/account` (financial records retained 5 years)
- **Right to Portability:** JSON export of all user-generated content
- **Right to Correction:** Update profile via `/api/auth/profile`

### Data Retention
- **User accounts:** Indefinite (until deletion requested)
- **Financial records:** 5 years (tax compliance)
- **Logs:** 90 days
- **Session tokens:** 7 days (refresh token expiration)
- **Deleted accounts:** CPF/email retained for 5 years (fraud prevention)

---

## 🛠️ Development Security Guidelines

### Code Review Checklist
- [ ] All user inputs validated with Zod schemas
- [ ] Authorization checks on all protected endpoints
- [ ] No secrets in code (use environment variables)
- [ ] No SQL raw queries without parameterization
- [ ] File uploads go through validation
- [ ] Errors don't expose sensitive information
- [ ] Logging doesn't include PII or tokens

### Dependency Management
- Run `pnpm audit` before every release
- Update dependencies monthly
- Pin major versions to avoid breaking changes
- Review changelogs for security fixes

### Testing
- Write tests for authorization logic
- Test IDOR scenarios (user A accessing user B's resources)
- Fuzz test all input validation
- Run OWASP ZAP or Burp Suite scans

---

## 📚 Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

---

**Last Updated:** 2026-01-02  
**Version:** 1.0  
**Maintainer:** Security Team
