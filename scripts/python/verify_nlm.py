import asyncio
from notebooklm_mcp_server.server import list_notebooks

async def main():
    try:
        notebooks = await list_notebooks()
        print("--- NOTEBOOKS START ---")
        for nb in notebooks:
            print(f"- {nb.get('title', 'No Title')} ({nb.get('id')})")
        print("--- NOTEBOOKS END ---")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
