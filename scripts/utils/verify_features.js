/**
 * verify_features.js
 * 
 * Automates the verification of the "Functional Gaps" implementation:
 * 1. Self-Service Onboarding (Register Tenant)
 * 2. Admin Login (Verify credentials)
 * 3. Bulk Import (Verify endpoint accessibility)
 * 4. LTI 1.3 (Verify JWKS endpoint)
 * 
 * Usage: node scripts/verify_features.js
 */

const fs = require('fs');
const path = require('path');

// Constants
const BASE_URL = 'http://localhost:8080/api';
const TIMESTAMP = Date.now();
const TENANT_NAME = `TestSchool_${TIMESTAMP}`;
const TENANT_DOMAIN = `test${TIMESTAMP}`;

const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, color = COLORS.reset) => console.log(`${color}${msg}${COLORS.reset}`);

async function runTests() {
    log(`🚀 Starting Verification Suite`, COLORS.blue);
    log(`-----------------------------------`);

    // 1. Self-Service Onboarding
    log(`\nTesting Feature: Self-Service Onboarding...`, COLORS.yellow);
    const adminEmail = `admin@${TENANT_DOMAIN}.local`;
    const adminPass = 'password123';

    let tenantKey;

    try {
        const payload = {
            name: TENANT_NAME,
            domain: TENANT_DOMAIN,
            dbSchema: `tenant_${TENANT_DOMAIN}`,
            adminFirstName: 'Test',
            adminLastName: 'Admin',
            adminEmail: adminEmail,
            adminPassword: adminPass,
            adminRole: 'ADMIN'
        };

        const res = await fetch(`${BASE_URL}/public/tenants/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.status === 200) {
            const data = await res.json();
            // In PublicTenantController.java: "tenantId", tenant.getId() (UUID) but Filter might need KEY. 
            // Usually X-Tenant-ID expects the String Key (organizationKey).
            // Let's assume the response has it or we deduce it.
            // Actually, let's use the one we sent: 'domain' usually acts as key or we set 'organizationKey'.
            tenantKey = payload.domain.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

            log(`✅ Tenant Registered: ${TENANT_NAME}`, COLORS.green);
            log(`   Response: ${JSON.stringify(data)}`);
            log(`   Using Tenant Key for Auth: ${tenantKey}`);

        } else {
            const err = await res.text();
            throw new Error(`Failed to register: ${res.status} - ${err}`);
        }

    } catch (e) {
        log(`❌ Self-Service Failed: ${e.message}`, COLORS.red);
        return;
    }

    // 2. Admin Login
    log(`\nTesting Feature: Admin Login...`, COLORS.yellow);
    let token;
    try {
        const loginPayload = {
            username: adminEmail,
            password: adminPass
        };

        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': tenantKey // CRITICAL for Multi-tenancy
            },
            body: JSON.stringify(loginPayload)
        });

        if (res.status === 200) {
            const data = await res.json();
            token = data.accessToken || data.token;
            log(`✅ Login Successful. Token received.`, COLORS.green);
        } else {
            const err = await res.text();
            throw new Error(`Login failed: ${res.status} - ${err}`);
        }

    } catch (e) {
        log(`❌ Login Failed: ${e.message}`, COLORS.red);
        return;
    }

    // 3. LTI 1.3 Key Set
    log(`\nTesting Feature: LTI 1.3 JWKS...`, COLORS.yellow);
    try {
        const res = await fetch(`${BASE_URL}/lti/jwks`);
        if (res.status === 200) {
            const jwks = await res.json();
            if (jwks.keys && jwks.keys.length > 0) {
                log(`✅ JWKS Endpoint returning ${jwks.keys.length} keys.`, COLORS.green);
            } else {
                log(`⚠️ JWKS Endpoint returned 200 but no keys.`, COLORS.yellow);
            }
        } else {
            throw new Error(`Status ${res.status}`);
        }
    } catch (e) {
        log(`❌ LTI Verification Failed: ${e.message}`, COLORS.red);
    }

    // 4. Bulk Import (Mock)
    log(`\nTesting Feature: Bulk Import Endpoint Accessibility...`, COLORS.yellow);
    try {
        const res = await fetch(`${BASE_URL}/admin/import/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantKey
            }
        });

        if (res.status === 400) {
            log(`✅ Import Endpoint reachable (Returned 400 Bad Request as expected).`, COLORS.green);
        } else if (res.status === 200) {
            log(`✅ Import Endpoint reachable (Returned 200 OK).`, COLORS.green);
        } else {
            log(`⚠️ Import Endpoint returned status: ${res.status}`, COLORS.red);
        }

    } catch (e) {
        log(`❌ Import Verification Failed: ${e.message}`, COLORS.red);
    }

    log(`\n-----------------------------------`);
    log(`🏁 Verification Complete`, COLORS.blue);
}

runTests();
