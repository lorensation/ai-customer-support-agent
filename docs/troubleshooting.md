# Troubleshooting Guide - SaaSify

## Common Issues and Solutions

### Login & Authentication Issues

#### Unable to Log In
**Symptoms:** "Invalid credentials" error or login page keeps refreshing

**Solutions:**
1. Verify your email address is correct (no extra spaces)
2. Check if Caps Lock is enabled
3. Try resetting your password via "Forgot Password" link
4. Clear browser cache and cookies
5. Try logging in from an incognito/private window
6. Disable browser extensions temporarily
7. Try a different browser

**Still not working?** Contact support@saasify.com with your email address.

#### Two-Factor Authentication Not Working
**Symptoms:** "Invalid code" error when entering 2FA code

**Solutions:**
1. Ensure your device time is synchronized (critical for TOTP codes)
2. Wait for a new code to generate (codes expire every 30 seconds)
3. Check you're using the correct authenticator app
4. Try entering the code without spaces or dashes
5. Use a backup code if you saved them during setup

**Lost access to authenticator?** Contact support with photo ID to reset 2FA.

#### Session Keeps Expiring
**Symptoms:** Logged out frequently, "Session expired" messages

**Solutions:**
1. Check "Remember me" box when logging in
2. Ensure browser cookies are enabled
3. Check if company firewall is blocking session cookies
4. Update your browser to the latest version
5. Check Settings → Security → Session Timeout and increase duration

---

### Performance Issues

#### Slow Loading Times
**Symptoms:** Pages take more than 5 seconds to load

**Diagnostics:**
1. Check your internet speed (minimum 5 Mbps recommended)
2. Monitor browser console for errors (F12 → Console tab)
3. Check if issue occurs on all pages or specific ones

**Solutions:**
1. Close unnecessary browser tabs
2. Clear browser cache: Settings → Privacy → Clear browsing data
3. Disable browser extensions that might interfere
4. Update browser to latest version
5. Try using a different network (WiFi vs mobile data)
6. Check if your antivirus is scanning downloads

**For IT Admins:** Whitelist *.saasify.com in your firewall/proxy.

#### App Freezing or Crashing
**Symptoms:** Application becomes unresponsive, browser tab crashes

**Solutions:**
1. Check available RAM (minimum 4GB recommended)
2. Close other applications to free up memory
3. Update your browser to the latest version
4. Disable hardware acceleration: Browser Settings → Advanced → System
5. Try the desktop app instead of web version
6. Reduce number of projects loaded simultaneously

#### Files Won't Upload
**Symptoms:** Upload progress bar stuck, "Upload failed" errors

**Checks:**
- File size within plan limits (Free: 10MB, Pro: 100MB, Enterprise: 2GB)
- Stable internet connection
- Supported file format
- Sufficient storage space remaining in your account

**Solutions:**
1. Try a smaller file first to test
2. Compress large files before uploading
3. Use wired connection instead of WiFi
4. Disable VPN temporarily
5. Try uploading via desktop app
6. Split large files into smaller parts

---

### Collaboration & Sharing Issues

#### Invited User Not Receiving Email
**Symptoms:** Team member says they didn't receive invitation

**Solutions:**
1. Check if email was sent to correct address (view in Settings → Team)
2. Ask them to check spam/junk folder
3. Verify their email server isn't blocking saasify.com
4. Resend invitation (click "Resend" next to their name)
5. Try inviting with different email address
6. Copy invite link and send via alternate channel (Slack, SMS)

**Note:** Invitations expire after 7 days. Resend if expired.

#### Can't Share Project with External User
**Symptoms:** Guest invite not working, "Permission denied" error

**Solutions:**
1. Verify external sharing is enabled (Settings → Workspace → Allow external guests)
2. Check if you have permission to invite guests (Admin or Member role required)
3. Ensure you're on a plan that supports guests (all plans support unlimited guests)
4. Try inviting as "View Only" first, then upgrade permissions
5. Check if guest's email domain is blocked in Workspace settings

#### Changes Not Syncing in Real-Time
**Symptoms:** Other users' edits not appearing, stale data

**Solutions:**
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check WebSocket connection (look for red dot in bottom-left corner)
3. Check if browser is blocking WebSocket connections
4. Disable browser extensions that might interfere
5. Check firewall settings (port 443 must be open)
6. Try different network

---

### Integration Issues

#### Slack Integration Not Working
**Symptoms:** No notifications in Slack, commands not responding

**Solutions:**
1. Verify Slack workspace is connected: Settings → Integrations → Slack
2. Click "Reconnect" to refresh authentication
3. Check Slack app permissions (must allow notifications)
4. Verify correct channel is selected for notifications
5. Test with /saasify command in Slack to verify connection
6. Remove and re-add the integration

#### Google Calendar Sync Issues
**Symptoms:** Tasks not appearing in calendar, wrong times

**Solutions:**
1. Reconnect Google account: Settings → Integrations → Google Calendar
2. Grant calendar write permissions when prompted
3. Check timezone settings match (Settings → Preferences → Timezone)
4. Refresh calendar in Google Calendar app
5. Ensure tasks have due dates set
6. Check sync frequency settings (minimum: every 15 minutes)

#### API Authentication Failing
**Symptoms:** 401 Unauthorized errors, API calls rejected

**Solutions:**
1. Verify API key is correct (Settings → API → Copy key)
2. Check if API key has been regenerated recently
3. Ensure Authorization header format: `Bearer YOUR_API_KEY`
4. Verify API endpoint URL is correct (https://api.saasify.com/v1/)
5. Check if API rate limits have been exceeded
6. Confirm your plan includes API access

---

### Mobile App Issues

#### App Won't Install
**Symptoms:** Download fails, "Cannot install" error

**Solutions:**
1. Check device compatibility:
   - iOS: Requires iOS 14.0 or later
   - Android: Requires Android 8.0 (API level 26) or later
2. Free up storage space (minimum 100MB required)
3. Update your device OS to latest version
4. Try downloading from official store only (App Store or Google Play)
5. Restart your device and try again

#### Offline Mode Not Working
**Symptoms:** Can't access data without internet, sync errors

**Solutions:**
1. Enable offline mode: App Settings → Offline Mode → On
2. Ensure projects were opened while online (this caches them)
3. Check available storage (minimum 500MB recommended for offline)
4. Manually sync before going offline: Pull down to refresh
5. Update app to latest version
6. Re-install app if problem persists

#### Push Notifications Not Arriving
**Symptoms:** No alerts for mentions, deadlines, or updates

**Solutions:**
1. Check app notification settings: Device Settings → Notifications → SaaSify
2. Enable notifications in app: App Settings → Notifications → Enable all
3. Check Do Not Disturb mode isn't active
4. Ensure battery optimization isn't blocking background activity
5. Re-login to refresh notification tokens
6. Reinstall the app

---

### Data & Export Issues

#### Export Taking Too Long
**Symptoms:** Export request pending for hours, no download link received

**Expected Times:**
- Small projects (< 100 tasks): 5-10 minutes
- Medium projects (100-1000 tasks): 15-30 minutes  
- Large projects (> 1000 tasks): 1-2 hours

**Solutions:**
1. Check email spam folder for download link
2. Try exporting smaller date ranges or specific projects
3. Use CSV format instead of PDF (faster processing)
4. Avoid peak hours (9am-5pm EST)
5. Contact support if waiting more than 24 hours

#### Missing Data After Import
**Symptoms:** Some tasks, comments, or files missing after import

**Solutions:**
1. Check import log for errors: Settings → Data Import → View Log
2. Verify source file format matches requirements
3. Ensure file wasn't corrupted during download
4. Check if imported data exceeds plan limits
5. Try importing in smaller batches
6. Contact support with import log file

---

### Billing & Account Issues

#### Payment Failed
**Symptoms:** "Payment declined" error, subscription suspended

**Solutions:**
1. Verify card details are correct and card hasn't expired
2. Check sufficient funds available
3. Contact your bank (may be blocking international charges)
4. Try different payment method
5. Update billing information: Settings → Billing → Update payment method
6. Contact support@saasify.com if issue persists

**Account suspended?** You have 7 days grace period to update payment before data deletion.

#### Charged Incorrectly
**Symptoms:** Unexpected charges, wrong amount billed

**Steps:**
1. Review billing history: Settings → Billing → Transaction History
2. Check if you upgraded mid-cycle (prorated charges apply)
3. Verify number of active users (you're billed per user)
4. Check for add-ons or extra storage charges
5. Download invoice for detailed breakdown
6. Contact billing@saasify.com with transaction ID

---

## Still Need Help?

### Before Contacting Support
1. ✅ Check this troubleshooting guide
2. ✅ Search knowledge base: help.saasify.com
3. ✅ Check status page: status.saasify.com
4. ✅ Try the solutions above

### Contact Options

**Free Plan:**
- Community Forum: community.saasify.com
- Knowledge Base: help.saasify.com

**Professional Plan:**
- Email: support@saasify.com (24-hour response time)
- Live Chat: Click chat icon (9am-6pm EST, Mon-Fri)

**Enterprise Plan:**
- Priority Email: priority@saasify.com (1-hour response time)
- Phone: 1-800-SAASIFY (24/7)
- Dedicated Support: Your account manager

### Information to Include
When contacting support, please provide:
- Your email address / account ID
- Browser and version (if web issue)
- Device and OS (if mobile issue)
- Steps to reproduce the issue
- Screenshots or screen recording
- Error messages (exact text)
- When issue started occurring
