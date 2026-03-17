from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class PersuasionOutput(BaseModel):
    tactics: List[str] = Field(description="List of detected psychological manipulation tactics.")

def persuasion_node(state: TrustState):
    llm = get_nemotron().with_structured_output(PersuasionOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert in behavioral psychology and scam detection. Analyze the content for manipulation tactics like artificial scarcity, fear-based pressure, authority impersonation, or religious/trust appeals."),
        ("user", "Input text:\n\n{input_content}")
    ])
    
    chain = prompt | llm
    result = chain.invoke({"input_content": state["input_content"]})
    
    return {
        "persuasion_tactics": result.tactics
    }
