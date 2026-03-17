from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class ClassifierOutput(BaseModel):
    content_type: str = Field(description="The type of content (e.g., job offer, rental listing, crypto DM, etc.)")
    initial_risk_level: str = Field(description="Initial risk category: LOW, MEDIUM, HIGH, or CRITICAL")

def classifier_node(state: TrustState):
    llm = get_nemotron().with_structured_output(ClassifierOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert scam classifier. Analyze the following content and determine its category and initial risk level. Err on the side of caution."),
        ("user", "Content to analyze:\n\n{input_content}")
    ])
    
    chain = prompt | llm
    result = chain.invoke({"input_content": state["input_content"]})
    
    return {
        "content_type": result.content_type,
        "initial_risk_level": result.initial_risk_level
    }
