import json
import time
import uuid
import base64
import requests
from jose import jwt, jwk
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# CONFIGURATION
BACKEND_URL = "http://localhost:8080/api/lti"
TENANT_ID = "alex" # Change if needed
ISSUER = "https://mock-lms.com"
CLIENT_ID = "eduflex-client-id"
DEPLOYMENT_ID = "deployment-1"

# 1. Generate RSA Keys for the Mock LMS
print("Generating Mock LMS Keys...")
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')

# 2. Create LTI Claims
claims = {
    "iss": ISSUER,
    "sub": "user-123",
    "aud": CLIENT_ID,
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600,
    "nonce": str(uuid.uuid4()),
    "name": "LTI Test Teacher",
    "given_name": "LTI Test",
    "family_name": "Teacher",
    "email": "teacher@mock-lms.com",
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": DEPLOYMENT_ID,
    "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": "http://localhost:5173/lti-launch",
    "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
        "id": "resource-1",
        "title": "Introduction to Databases"
    },
    "https://purl.imsglobal.org/spec/lti/claim/roles": [
        "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
    ],
    "https://purl.imsglobal.org/spec/lti/claim/context": {
        "id": "course-1",
        "label": "DB101",
        "title": "Databases 101"
    }
}

# 3. Sign the ID Token
token = jwt.encode(claims, pem, algorithm='RS256', headers={"kid": "mock-kid"})
print(f"\nGenerated ID Token: {token[:50]}...")

# 4. Mock JWKS (in a real test, the backend would fetch this from an URL)
# For local testing, we might need a small server to serve this, 
# or use a platform config in the DB that points to a temporary serving endpoint.
# But for now, we just print the instructions.

print("\n--- TEST STEPS ---")
print("1. Ensure the backend is running.")
print("2. You need to add this platform to EduFlex first via the Admin UI or SQL:")
print(f"   Issuer: {ISSUER}")
print(f"   Client ID: {CLIENT_ID}")
print(f"   Deployment ID: {DEPLOYMENT_ID}")
print("   JWKS URL: http://localhost:9999/jwks")

# Since we can't easily host a JWKS URL from this script without a server,
# we might want to implement a simple HTTP server in this script if needed.

def run_server():
    from http.server import HTTPServer, BaseHTTPRequestHandler
    
    class JWKSHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/jwks":
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                # Convert public key to JWK
                public_numbers = public_key.public_numbers()
                e = base64.urlsafe_b64encode(public_numbers.e.to_bytes((public_numbers.e.bit_length() + 7) // 8, 'big')).decode('utf-8').rstrip('=')
                n = base64.urlsafe_b64encode(public_numbers.n.to_bytes((public_numbers.n.bit_length() + 7) // 8, 'big')).decode('utf-8').rstrip('=')
                
                jwk_data = {
                    "keys": [
                        {
                            "kty": "RSA",
                            "alg": "RS256",
                            "use": "sig",
                            "kid": "mock-kid",
                            "n": n,
                            "e": e
                        }
                    ]
                }
                self.wfile.write(json.dumps(jwk_data).encode())
            else:
                self.send_response(404)
                self.end_headers()

    server = HTTPServer(('localhost', 9999), JWKSHandler)
    print("\nStarting Mock JWKS server on http://localhost:9999/jwks...")
    print("Use this URL when registering the platform in EduFlex.")
    
    print("\nOnce registered, you can simulate a launch by POSTing to /api/lti/launch")
    print(f"URL: {BACKEND_URL}/launch")
    print(f"POST Body: id_token={token}")
    
    server.serve_forever()

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nStopping server...")
