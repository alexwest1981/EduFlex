import json
import time
import uuid
import base64
import requests
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from jose import jwt
import cryptography
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# CONFIGURATION
BACKEND_URL = "http://localhost:8080/api/lti"
ISSUER = "https://mock-lms.com"
CLIENT_ID = "eduflex-client-id"
DEPLOYMENT_ID = "deployment-1"

# 1. Generate RSA Keys
print("Generating RSA Keys...")
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')

# 2. Start Mock JWKS Server in Background
class JWKSHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return # Silence logging

    def do_GET(self):
        if self.path == "/jwks":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
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
server_thread = threading.Thread(target=server.serve_forever)
server_thread.daemon = True
server_thread.start()
print("JWKS Server started on http://localhost:9999/jwks")

# 3. Create and Sign LTI ID Token
claims = {
    "iss": ISSUER,
    "sub": str(uuid.uuid4()),
    "aud": CLIENT_ID,
    "iat": int(time.time()),
    "exp": int(time.time()) + 300,
    "nonce": str(uuid.uuid4()),
    "name": "LTI Automated Tester",
    "email": "tester@mock-lms.com",
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": DEPLOYMENT_ID,
    "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": "http://localhost:5173/lti-launch",
    "https://purl.imsglobal.org/spec/lti/claim/resource_link": {"id": "res-1"},
    "https://purl.imsglobal.org/spec/lti/claim/roles": [
        "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
    ]
}

id_token = jwt.encode(claims, pem, algorithm='RS256', headers={"kid": "mock-kid"})
print("Generated signed ID Token.")

# 4. Perform Launch Request
print(f"Sending launch request to {BACKEND_URL}/launch...")
try:
    response = requests.post(
        f"{BACKEND_URL}/launch",
        data={"id_token": id_token},
        allow_redirects=False # We want to see the redirect URL
    )

    print(f"\nResponse Status: {response.status_code}")
    if response.status_code == 302:
        redirect_url = response.headers.get("Location")
        print(f"✅ Launch SUCCESS! Redirected to: {redirect_url}")
        if "lti-success" in redirect_url:
            print("✨ The backend successfully verified the signature and provisioned the user.")
    else:
        print(f"❌ Launch FAILED! Response: {response.text}")

except Exception as e:
    print(f"💥 Error during request: {e}")

finally:
    server.shutdown()
    print("\nJWKS Server stopped.")
