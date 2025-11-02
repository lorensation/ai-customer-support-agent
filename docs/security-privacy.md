# Security & Privacy - SaaSify

## Our Commitment to Security

At SaaSify, we take security seriously. This document outlines our security practices, compliance certifications, and how we protect your data.

---

## Data Security

### Encryption

**Data in Transit:**
- All connections use TLS 1.3 encryption
- HTTPS enforced across all endpoints
- Perfect Forward Secrecy (PFS) enabled
- A+ SSL Labs rating

**Data at Rest:**
- AES-256 encryption for all stored data
- Encrypted database backups
- Encrypted file storage
- Full disk encryption on all servers

**End-to-End Encryption:**
- Available for sensitive documents (Enterprise plan)
- Client-side encryption before upload
- Zero-knowledge architecture
- Only you hold decryption keys

### Data Storage

**Primary Storage:**
- Amazon AWS infrastructure
- Multi-region redundancy
- Data center locations: US-East, US-West, EU-West, Asia-Pacific
- You choose your primary region during setup

**Backups:**
- Automatic daily backups
- 30-day backup retention
- Encrypted and geographically distributed
- Point-in-time recovery available
- Enterprise: Custom backup schedules

**Data Residency:**
- Choose where your data is stored
- GDPR-compliant EU data residency option
- Data never leaves chosen region (except backups)

---

## Authentication & Access Control

### Account Security

**Password Requirements:**
- Minimum 8 characters
- Must include uppercase, lowercase, number
- Special characters recommended
- Cannot reuse last 5 passwords
- Password strength meter during creation

**Two-Factor Authentication (2FA):**
- Supported via TOTP (Time-based One-Time Password)
- Compatible with Google Authenticator, Authy, 1Password
- Backup codes provided (10 codes)
- Mandatory for Admin roles (can be enforced workspace-wide)

**Session Management:**
- Automatic logout after 30 days of inactivity (configurable)
- Active session monitoring
- Remote session termination
- Login alerts for new devices

### Single Sign-On (SSO)

**Available on Enterprise Plan:**
- SAML 2.0 support
- Supports Okta, Azure AD, Google Workspace, OneLogin
- Just-in-time (JIT) provisioning
- Automatic user provisioning and deprovisioning

**Setup:**
1. Contact support to enable SSO
2. Provide IdP metadata
3. Configure attribute mapping
4. Test with small user group
5. Roll out to organization

### Role-Based Access Control (RBAC)

**Default Roles:**

**Owner:**
- Full workspace control
- Billing management
- User management
- Cannot be removed (transferable)

**Admin:**
- User management
- Project creation and deletion
- Workspace settings
- Cannot access billing

**Member:**
- Create and manage own projects
- Invite guests to their projects
- View workspace members
- No admin access

**Guest:**
- Access only assigned projects
- Cannot see workspace members
- Cannot create projects
- No billing visibility

**Custom Roles (Enterprise):**
- Define granular permissions
- Create role templates
- Apply across workspaces
- Audit role assignments

---

## Compliance & Certifications

### Current Certifications

**SOC 2 Type II:**
- Annual third-party audits
- Security, availability, confidentiality controls
- Report available under NDA (Enterprise customers)

**GDPR Compliance:**
- EU representative appointed
- Data Processing Agreement (DPA) available
- Right to access, rectification, deletion
- Data portability support
- Breach notification within 72 hours

**ISO 27001 (In Progress):**
- Expected certification: Q2 2026
- Information security management system
- Regular risk assessments

**HIPAA (Available on Request):**
- Business Associate Agreement (BAA)
- Additional security controls
- Healthcare-specific features
- Contact sales for details

### Privacy Shield & International Transfers

- Standard Contractual Clauses (SCCs) for EU data
- Privacy Shield certified (US-EU, US-Swiss)
- APEC CBPR certified for Asia-Pacific transfers

---

## Privacy Practices

### Data Collection

**What We Collect:**
- Account information (name, email, company)
- Usage data (features used, time spent)
- Device information (browser, OS, IP address)
- Content you create (tasks, projects, files)
- Communication preferences

**What We DON'T Collect:**
- Financial information (stored by payment processor only)
- Social Security Numbers or government IDs
- Unnecessary personal data

### Data Usage

**How We Use Your Data:**
- Provide and improve our service
- Customer support
- Security and fraud prevention
- Legal compliance
- Communications (with your consent)

**We Never:**
- Sell your data to third parties
- Use your data for advertising
- Share data without permission (except legal requirements)
- Train AI models on your content without permission

### Data Retention

**Active Accounts:**
- Data retained as long as account is active
- You control deletion of content

**Closed Accounts:**
- 30-day grace period (read-only access)
- Data deleted after 60 days
- Backups purged after 90 days
- Some data retained for legal/compliance reasons:
  - Billing records: 7 years
  - Audit logs: 1 year
  - Support tickets: 3 years

### Data Rights (GDPR)

**Your Rights:**
- **Access:** Request copy of your data
- **Rectification:** Correct inaccurate data
- **Erasure:** Request deletion ("right to be forgotten")
- **Portability:** Export data in machine-readable format
- **Restriction:** Limit how we process your data
- **Objection:** Opt out of certain data processing
- **Automated Decisions:** Challenge automated decisions

**How to Exercise Rights:**
1. Email privacy@saasify.com with request
2. We verify your identity
3. Respond within 30 days
4. No charge for reasonable requests

---

## Application Security

### Development Security

**Secure Development Lifecycle:**
- Security training for all developers
- Code reviews required for all changes
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- Dependency scanning for vulnerabilities

**Third-Party Components:**
- Regular updates and patching
- Vulnerability monitoring
- License compliance
- Vendor security assessments

### Infrastructure Security

**Network Security:**
- Web Application Firewall (WAF)
- DDoS protection
- Intrusion Detection System (IDS)
- Network segmentation
- VPC isolation

**Server Security:**
- Hardened OS configurations
- Automatic security patching
- Least privilege access
- Immutable infrastructure
- Regular vulnerability scanning

**Monitoring & Logging:**
- 24/7 security monitoring
- Centralized logging
- Anomaly detection
- Alerting for suspicious activity
- Log retention: 90 days (1 year for Enterprise)

---

## Incident Response

### Security Incident Process

**Detection:**
- Automated monitoring and alerts
- User reports (security@saasify.com)
- Third-party disclosures

**Response:**
1. Immediate investigation by security team
2. Contain and mitigate threat
3. Assess impact and affected users
4. Notify affected parties (if required)
5. Post-incident review and improvements

**Notification:**
- Data breaches: Within 72 hours (GDPR requirement)
- Affected users notified via email
- Public disclosure (if significant)
- Details posted on status.saasify.com

### Bug Bounty Program

**Program Details:**
- Responsible disclosure policy
- Rewards for valid security findings
- $100 - $10,000+ depending on severity
- Submit: security@saasify.com

**In Scope:**
- Web application (*.saasify.com)
- Mobile apps (iOS and Android)
- API endpoints
- Desktop applications

**Out of Scope:**
- Denial of Service (DoS)
- Social engineering
- Physical security
- Third-party services

---

## Employee Access & Training

### Access Controls

**Employee Access:**
- Principle of least privilege
- Role-based access to systems
- Just-in-time access for support
- All access logged and audited
- Background checks for all employees

**Support Access:**
- No access to customer data without permission
- Access only granted with support ticket
- Time-limited access tokens
- All actions logged
- Regular access reviews

### Security Training

**All Employees:**
- Security awareness training (annual)
- Phishing simulations (quarterly)
- Secure coding training (developers)
- Incident response drills
- GDPR and privacy training

---

## Subprocessors & Third Parties

### Key Subprocessors

**AWS (Amazon Web Services):**
- Infrastructure hosting
- Data storage and backups
- Location: Your chosen region
- SOC 2, ISO 27001 certified

**Stripe:**
- Payment processing
- PCI DSS Level 1 compliant
- Credit card data never touches our servers

**SendGrid:**
- Transactional email delivery
- Email tracking and analytics
- GDPR compliant

**Full List:** Available at saasify.com/subprocessors

### Vendor Management

- Due diligence for all vendors
- Data Processing Agreements (DPAs) in place
- Regular security assessments
- Notification of vendor changes (30 days advance)

---

## Security Best Practices for Users

### Account Security

**Strong Passwords:**
- Use password manager
- Unique password for SaaSify
- Change passwords regularly
- Never share passwords

**Enable 2FA:**
- Mandatory for admins
- Strongly recommended for all users
- Use authenticator app (not SMS)
- Store backup codes securely

**Monitor Activity:**
- Review active sessions regularly
- Check login history for suspicious activity
- Set up login alerts

### Data Protection

**Sensitive Information:**
- Don't store passwords in tasks
- Use private projects for confidential data
- Enable end-to-end encryption (Enterprise)
- Be careful with guest access

**File Security:**
- Scan files for malware before uploading
- Don't share direct file links publicly
- Review file permissions regularly

**Access Management:**
- Remove users immediately when they leave
- Use guest access for external collaborators
- Review team member roles quarterly
- Audit project permissions

---

## Reporting Security Issues

### How to Report

**Email:** security@saasify.com

**PGP Key:** Available at saasify.com/pgp

**Include:**
- Detailed description
- Steps to reproduce
- Impact assessment
- Proof of concept (if applicable)
- Your contact information

**Response Time:**
- Initial response: 24 hours
- Status updates: Every 48 hours
- Resolution timeline depends on severity

**We Appreciate:**
- Responsible disclosure
- Reasonable time to fix issues
- Not accessing/modifying other users' data
- Not causing service disruption

---

## Additional Resources

**Security Portal:** security.saasify.com
- Security policies
- Current certifications
- Security white papers
- Compliance documentation

**Status Page:** status.saasify.com
- System status
- Incident history
- Scheduled maintenance

**Contact:**
- General security questions: security@saasify.com
- Privacy questions: privacy@saasify.com
- Data protection officer: dpo@saasify.com

---

**Last Updated:** November 2, 2025

**Document Version:** 3.2

For the most current information, visit: saasify.com/security
