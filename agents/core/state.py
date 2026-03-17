from typing import TypedDict, Annotated, List, Dict, Any
from operator import add
from langgraph.graph.message import add_messages

class TrustState(TypedDict):
    # Original user input
    input_content: str
    messages: Annotated[list, add_messages]
    
    # 1. Classifier Agent Output
    content_type: str
    initial_risk_level: str
    
    # 2. Entity Extractor Output
    extracted_entities: Dict[str, List[str]]
    claims: List[str]
    
    # 3. OSINT Researcher Output
    osint_findings: Annotated[List[str], add]
    
    # 4. Forensic Analyst Output
    forensic_flags: Annotated[List[str], add]
    
    # 5. Persuasion Detector Output
    persuasion_tactics: Annotated[List[str], add]
    
    # 6. Verdict Synthesizer Output
    trust_score: int
    final_verdict: str
    recommendation: str
