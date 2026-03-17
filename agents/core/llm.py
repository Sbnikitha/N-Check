import os
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

def get_nemotron():
    """
    Initializes the NVIDIA Nemotron model via OpenRouter's OpenAI-compatible API.
    Model: nvidia/nvidia-nemotron-nano-9b-v2
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("Please provide an OPENROUTER_API_KEY environment variable.")

    return ChatOpenAI(
        model="nvidia/nvidia-nemotron-nano-9b-v2",
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=0.2, # Low temp for analytical tasks
        model_kwargs={
             "headers": {
                 "HTTP-Referer": "https://ncheck.ai",
                 "X-Title": "NCheck Trust Agent"
             }
        }
    )

def get_tavily_search():
    """
    Inits Tavily Search tool for OSINT operations.
    """
    if not os.getenv("TAVILY_API_KEY"):
         raise ValueError("Please provide a TAVILY_API_KEY environment variable.")
    return TavilySearchResults(max_results=3)
