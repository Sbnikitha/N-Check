from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class VerdictOutput(BaseModel):
    trust_score: int = Field(description="Score between 0 (Extreme Scam) and 100 (Completely Safe).")
    verdict: str = Field(description="Paragraph summarizing why this score was given.")
    recommendation: str = Field(description="One sentence recommendation on what the user should do.")

def verdict_node(state: TrustState):
    llm = get_nemotron().with_structured_output(VerdictOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the final Verdict Synthesizer. Review all evidence gathered by the previous agents to issue a final trust score (0-100), a detailed verdict explanation, and a recommendation. Scams get heavily penalized toward 0."),
        ("user", "Input Text: {input}\n\nOSINT Findings: {osint_findings}\nForensic Flags: {forensic_flags}\nPersuasion Tactics: {persuasion_tactics}\n\nSynthesize this evidence.")
    ])
    
    chain = prompt | llm
    
    # Safely get lists, as parallel add merges might make them nested if empty
    result = chain.invoke({
        "input": state["input_content"],
        "osint_findings": state.get("osint_findings", []),
        "forensic_flags": state.get("forensic_flags", []),
        "persuasion_tactics": state.get("persuasion_tactics", [])
    })
    
    return {
        "trust_score": result.trust_score,
        "final_verdict": result.verdict,
        "recommendation": result.recommendation
    }
