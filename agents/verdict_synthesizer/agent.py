from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from agents.core.llm import get_nemotron
from agents.core.state import TrustState

class FactWeight(BaseModel):
    fact: str = Field(description="The specific evidence or fact found")
    weightage: int = Field(description="How much this impacts the score (e.g., -20 for major scam, +10 for verified entity)")
    reasoning: str = Field(description="Why this weightage was given")

class VerdictOutput(BaseModel):
    trust_score: int = Field(default=50, description="Score between 0 (Extreme Scam) and 100 (Completely Safe).")
    final_verdict: str = Field(default="No verdict generated.", description="Paragraph summarizing why this score was given.")
    facts_and_weights: List[FactWeight] = Field(default_factory=list, description="List of facts/evidence with their statistical weight and reasoning")
    recommendation: str = Field(default="Proceed with caution.", description="One sentence recommendation on what the user should do.")
    plan_of_action: List[str] = Field(default_factory=list, description="Step-by-step plan of action for the user")

def verdict_node(state: TrustState):
    llm = get_nemotron().with_structured_output(VerdictOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the final Verdict Synthesizer. Review all evidence gathered by the previous agents. Issue a final trust score (0-100). Scams get penalized toward 0. Crucially, provide a detailed breakdown of the facts/evidence, assigning a 'weightage' (negative or positive impact on the score) and 'reasoning' for each fact. Finally, provide a step-by-step plan of action for the user."),
        ("user", "Input Text: {input}\n\nOSINT Findings: {osint_findings}\nForensic Flags: {forensic_flags}\nPersuasion Tactics: {persuasion_tactics}\n\nSynthesize this evidence into facts, weightages, trust score, and a plan of action.")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "input": state["input_content"],
        "osint_findings": state.get("osint_findings", []),
        "forensic_flags": state.get("forensic_flags", []),
        "persuasion_tactics": state.get("persuasion_tactics", [])
    })
    
    # Safety check for complex structured output
    score = 50
    verdict = "Could not synthesize verdict."
    facts = []
    reco = "Be cautious."
    plan = ["Verify details manually."]

    if result:
        if isinstance(result, dict):
            score = result.get("trust_score", 50)
            verdict = result.get("final_verdict", verdict)
            facts = [f.model_dump() if hasattr(f, "model_dump") else f for f in result.get("facts_and_weights", [])]
            reco = result.get("recommendation", reco)
            plan = result.get("plan_of_action", plan)
        else:
            score = getattr(result, "trust_score", 50)
            verdict = getattr(result, "final_verdict", verdict)
            raw_facts = getattr(result, "facts_and_weights", [])
            facts = [f.model_dump() if hasattr(f, "model_dump") else f for f in raw_facts]
            reco = getattr(result, "recommendation", reco)
            plan = getattr(result, "plan_of_action", plan)

    return {
        "trust_score": score,
        "final_verdict": verdict,
        "facts_and_weights": facts,
        "recommendation": reco,
        "plan_of_action": plan
    }
