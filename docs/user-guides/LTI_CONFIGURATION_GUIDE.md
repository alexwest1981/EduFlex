# LTI 1.3 Configuration Guide

This guide explains how to connect EduFlex to major Learning Management Systems (LMS) like Canvas, Moodle, and Blackboard using the LTI 1.3 standard.

## 1. Prerequisites
- **Admin Access**: You must be an Administrator in EduFlex.
- **SSL**: Your EduFlex instance must be running on HTTPS (`https://eduflexlms.se` or check your tunnel URL). LTI 1.3 **requires** HTTPS.

## 2. EduFlex Configuration (Admin Panel)
1.  Navigate to **System Settings** -> **LTI / LMS**.
2.  Click **New Connection**.
3.  Enter the details provided by your LMS (see sections below).

## 3. LMS Specific Guides

### Canvas LMS
1.  Go to **Admin** -> **Developer Keys**.
2.  Click **+ Developer Key** -> **LTI Key**.
3.  **Key Name**: "EduFlex LTI".
4.  **Redirect URIs**:
    - `https://eduflexlms.se/api/lti/launch`
5.  **Method**: Select "Enter URL".
6.  **JSON URL**: `https://eduflexlms.se/api/lti/jwks` (or manually configure placements).
7.  **Placements**: Select `Course Navigation`, `Link Selection`, `Assignment Selection`.
    - **Target Link URI**: `https://eduflexlms.se/api/lti/launch`
    - **Open ID Connect Initiation Url**: `https://eduflexlms.se/api/lti/login_init`
8.  **Save** the key.
9.  Copy the **Client ID** (number above the Show Key button).
10. In EduFlex, enter:
    - **Issuer**: `https://canvas.instructure.com`
    - **Client ID**: (The ID you copied)
    - **Auth URL**: `https://sso.canvaslms.com/api/lti/authorize_redirect`
    - **Token URL**: `https://sso.canvaslms.com/login/oauth2/token`
    - **JWKS URL**: `https://sso.canvaslms.com/api/lti/security/jwks`

### Moodle
1.  Go to **Site Administration** -> **Plugins** -> **External Tool** -> **Manage Tools**.
2.  Click **configure a tool manually**.
3.  **Tool URL**: `https://eduflexlms.se/api/lti/launch`
4.  **LTI Version**: LTI 1.3.
5.  **Public Key Type**: Keyset URL.
6.  **Public Keyset**: `https://eduflexlms.se/api/lti/jwks`
7.  **Initiate Login URL**: `https://eduflexlms.se/api/lti/login_init`
8.  **Redirection URI(s)**: `https://eduflexlms.se/api/lti/launch`
9.  **Save**.
10. Click the "List Icon" on your new tool to view **Tool Configuration Details**.
11. Copy the **Client ID**, **Platform ID (Issuer)**, **Authentication Request URL**, etc into EduFlex.

## 4. Verification
1.  Create an Assignment in Canvas/Moodle.
2.  Select "External Tool" -> EduFlex.
3.  Launch the tool.
4.  You should be automatically logged in to EduFlex as a user matching your LMS email.
