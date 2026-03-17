from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Dict
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class ExtractionOutput(BaseModel):
    extracted_entities: Dict[str, List[str]] = Field(description="Dictionary of entity types (e.g., 'URLs', 'Emails', 'Organizations', 'Prices') to lists of extracted values.")
    claims: List[str] = Field(description="List of verifiable claims made in the text (e.g., 'Guaranteed return of 50%', 'Offered hourly rate of $45').")

def extractor_node(state: TrustState):
    llm = get_nemotron().with_structured_output(ExtractionOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert entity extraction system. Extract all verifiable entities, contact details, URLs, financial amounts, and bold claims from the input."),
        ("user", "Content ({content_type}):\n\n{input_content}")
    ])
    
    chain = prompt | llm
    result = chain.invoke({
        "input_content": state["input_content"], 
        "content_type": state.get("content_type", "Unknown")
    })
    
    # Safety check for non-pydantic or None returns
    entities = {}
    claims = []
    if result:
        if isinstance(result, dict):
            entities = result.get("extracted_entities", {})
            claims = result.get("claims", [])
        else:
            entities = getattr(result, "extracted_entities", {})
            claims = getattr(result, "claims", [])

    return {
        "extracted_entities": entities,
        "claims": claims
    }
