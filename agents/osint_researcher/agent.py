from langchain_core.prompts import ChatPromptTemplate
from agents.core.llm import get_nemotron, get_tavily_search
from agents.core.state import TrustState
from langchain.agents import create_tool_calling_agent, AgentExecutor

def osint_node(state: TrustState):
    llm = get_nemotron()
    tools = [get_tavily_search()]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert OSINT researcher identifying fraud. Verify the following entities and claims using web search. Report any red flags (e.g., domain registered recently, company not found). Return a bulleted list of findings."),
        ("user", "Extracted Entities: {entities}\nClaims: {claims}\n\nDo your research and provide only the factual findings.")
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    # We serialize entities for the prompt
    result = agent_executor.invoke({
        "entities": str(state.get("extracted_entities", {})),
        "claims": str(state.get("claims", []))
    })
    
    # Assume output is a single string of findings we wrap in a list
    return {
        "osint_findings": [result["output"]]
    }
