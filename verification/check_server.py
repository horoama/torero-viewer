import requests

try:
    response = requests.get('http://localhost:3001')
    print(f"Status Code: {response.status_code}")
    print(response.text[:200]) # First 200 chars
except Exception as e:
    print(f"Error: {e}")
