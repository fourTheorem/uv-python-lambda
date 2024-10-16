import httpx

def make_request():
    response = httpx.get("https://jsonplaceholder.typicode.com/todos/1")
    response.raise_for_status()
    return response.json()