from dotenv import load_dotenv
import os
load_dotenv()
from agents.core.llm import get_nemotron
try:
    llm = get_nemotron()
    print("API Key loaded:", os.getenv("OPENROUTER_API_KEY")[:10] + "...")
    print(llm.invoke("Hello"))
except Exception as e:
    import traceback
    traceback.print_exc()
