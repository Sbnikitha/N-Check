from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class ForensicOutput(BaseModel):
    flags: List[str] = Field(description="List of detected structural anomalies/flags.")

def forensic_node(state: TrustState):
    llm = get_nemotron().with_structured_output(ForensicOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a forensic fraud analyst. Detect structural anomalies in this {content_type} such as pricing that is too good to be true, weird payment methods (Zelle/Wire), or broken English professional communications."),
        ("user", "Input:\n\n{input_content}")
    ])
    
    chain = prompt | llm
    result = chain.invoke({
        "input_content": state["input_content"],
        "content_type": state.get("content_type", "Unknown")
    })
    
    return {
        "forensic_flags": result.flags
    }
