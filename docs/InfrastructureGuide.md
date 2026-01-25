# EduFlex Infrastructure & Networking Guide

This document is the "Source of Truth" for the EduFlex networking stack. Follow it strictly to avoid downtime, 502 errors, or 401 loops.

## 1. Cloudflare Tunnel Configuration (`cloudflared-config.yml`)

### Critical Rules
1.  **Use `127.0.0.1`**: Never use `localhost`. This prevents IPv6/IPv4 binding conflicts on Windows.
2.  **Origin Request Settings**: Always include timeouts to prevent 502s on heavy loads.
    ```yaml
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true
    ```
3.  **Explicit Asset Routing**: Frontend assets **MUST** be routed explicitly to port 5173 to prevent them from hitting the backend (which causes 401 Unauthorized).

### Routing Table (Order Matters)
| Path | Service | Port | Description |
|---|---|---|---|
| `/web-apps/*` | OnlyOffice | 8081 | Document Server UI |
| `/cache/*` | OnlyOffice | 8081 | Document Cache |
| `/8.x.x/*` | OnlyOffice | 8081 | Versioned resources |
| `/src/*` | Frontend | 5173 | **Critical**: Source code |
| `/assets/*` | Frontend | 5173 | **Critical**: Compiled assets |
| `/api/*` | Backend | 8080 | API Endpoints |
| `/oauth2/*` | Backend | 8080 | Auth/Login |
| `/` (Root) | Frontend | 5173 | React App |

## 2. Frontend Development (`vite.config.js`)

To prevent "White Screen" or "WebSocket connection failed":
- **HMR Configuration**: Must be set for the tunnel.
  ```js
  hmr: {
      host: 'www.eduflexlms.se',
      clientPort: 443,
      protocol: 'wss'
  }
  ```

## 3. OnlyOffice Integration

### Backend (`OnlyOfficeController.java`)
-   **Internal Communication**: The container uses `http://eduflex-backend:8080` for `document.url`.
-   **Client Communication**: The `documentServerUrl` MUST match the public Base URL (e.g., `https://www.eduflexlms.se`) so the browser can load JS/CSS resources relative to it.
-   **Callback/Download**: Use `internalBackendUrl` for the server-to-server part so `onlyoffice-ds` can reach `backend` directly via Docker network.

## 4. MinIO Object Storage
### Public Access Fix
If images are not loading from `storage.eduflexlms.se`, the bucket policy might be private.
- **Problem**: Default MinIO buckets are private.
- **Solution**: Set policy to `download` using the MinIO client:
  ```powershell
  mc anonymous set download myminio/eduflex-storage
  ```
- **Verification**: `curl -I http://localhost:9000/eduflex-storage/filename.jpg` should return `200 OK`.

## 5. Troubleshooting Guide

### 🔴 401 Unauthorized on `api.js` or `index.css`
-   **Cause**: The request is hitting the Backend (8080) instead of the Frontend (5173).
-   **Solution 1**: Check `cloudflared-config.yml`. Are `/src/*` and `/assets/*` explicitly routed to 5173?
-   **Solution 2**: **GHOST PROCESSES**. A stuck `cloudflared` Service (PID X) might be running in the background with old config.
    -   **Fix**: Task Manager -> Details -> Kill ALL `cloudflared.exe` processes. Then restart the tunnel.

### 🔴 502 Bad Gateway
-   **Cause**: Tunnel cannot reach the local service.
-   **Solution**:
    1.  Ensure the service is up (`curl -I http://127.0.0.1:5173`).
    2.  Check for IPv6 issues (use `127.0.0.1`).
    3.  Restart the Cloudflare tunnel (`taskkill /F /IM cloudflared.exe` -> Start new).

### ⚪ White Screen (Frontend)
-   **Cause**: WebSocket/HMR failure or stale cache.
-   **Solution**:
    1.  Hard Reload (`Ctrl + F5`).
    2.  Check Console for red errors.
    3.  Verify `vite.config.js` HMR settings.

## 5. Maintenance Scripts
Always use these scripts in `scripts/powershell/` to ensure consistency:
-   `rebuild_all.ps1`: Full rebuild + Tunnel start.
-   `start_app.ps1`: Quick start services + Tunnel start.
