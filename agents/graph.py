from langgraph.graph import StateGraph, END
from agents.core.state import TrustState

from agents.classifier.agent import classifier_node
from agents.entity_extractor.agent import extractor_node
from agents.osint_researcher.agent import osint_node
from agents.forensic_analyst.agent import forensic_node
from agents.persuasion_detector.agent import persuasion_node
from agents.verdict_synthesizer.agent import verdict_node

def build_trust_pipeline():
    workflow = StateGraph(TrustState)

    # 1. Add nodes
    workflow.add_node("Classifier", classifier_node)
    workflow.add_node("Extractor", extractor_node)
    
    # We can group parallel tasks mathematically in LangGraph 
    # but for explicit structure we add them as nodes:
    workflow.add_node("OSINTOperator", osint_node)
    workflow.add_node("ForensicGenius", forensic_node)
    workflow.add_node("PersuasionSniffer", persuasion_node)
    
    workflow.add_node("Synthesizer", verdict_node)

    # 2. Define Workflow Sequence
    workflow.set_entry_point("Classifier")
    workflow.add_edge("Classifier", "Extractor")
    
    # 3. Branch out to parallel agents
    workflow.add_edge("Extractor", "OSINTOperator")
    workflow.add_edge("Extractor", "ForensicGenius")
    workflow.add_edge("Extractor", "PersuasionSniffer")
    
    # 4. Merge back to Synthesizer
    workflow.add_edge("OSINTOperator", "Synthesizer")
    workflow.add_edge("ForensicGenius", "Synthesizer")
    workflow.add_edge("PersuasionSniffer", "Synthesizer")
    
    # End state
    workflow.add_edge("Synthesizer", END)

    # 5. Compile the graph
    app = workflow.compile()
    return app
