import urllib.request
import json
import sys

# Append tenantId as query parameter to bypass header stripping issues
url = 'http://localhost:8080/api/auth/login?tenantId=saas-onboarding'
headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'saas-onboarding' # Keeping header just in case, but rely on query param
}
data = {
    'email': 'onboarding@test.local',
    'password': 'password123'
}

try:
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
    
    print(f"Sending POST to {url} with headers {headers}")
    
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print(f"Response Body: {response.read().decode('utf-8')}")
        
        if response.status == 200:
            print("LOGIN SUCCESS")
            sys.exit(0)

except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code} - {e.reason}")
    print(f"Error Body: {e.read().decode('utf-8')}")
    sys.exit(1)
except Exception as e:
    print(f"EXCEPTION: {e}")
    sys.exit(1)
