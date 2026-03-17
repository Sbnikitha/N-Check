# NCheck Agents

This directory contains the implementation of the 6 specialized AI agents that power the TrustCheck AI verification engine. These agents work in sequence and parallel, orchestrated via LangGraph, and are built on NVIDIA Nemotron (`nvidia/nvidia-nemotron-nano-9b-v2`).

## Folder Structure

```text
agents/
│
├── core/                       # Shared agent utilities
│   ├── llm.py                  # Nemotron API setup & interactions 
│   ├── state.py                # LangGraph state definitions
│   └── tools.py                # Tools (e.g., Tavily web search, WHOIS)
│
├── classifier/                 # 1. Classifier Agent
│   ├── prompt.py               # Identifies content type & risk level
│   └── agent.py                
│
├── entity_extractor/           # 2. Entity Extractor
│   ├── prompt.py               # Extracts names, URLs, addresses, claims
│   └── agent.py                
│
├── osint_researcher/           # 3. OSINT Researcher
│   ├── prompt.py               # Web searches and API verification
│   └── agent.py                
│
├── forensic_analyst/           # 4. Forensic Analyst
│   ├── prompt.py               # Checks for structural scam patterns
│   └── agent.py                
│
├── persuasion_detector/        # 5. Persuasion Detector
│   ├── prompt.py               # Analyzes psychological manipulation
│   └── agent.py                
│
├── verdict_synthesizer/        # 6. Verdict Synthesizer
│   ├── prompt.py               # Aggregates findings securely
│   └── agent.py                
│
├── graph.py                    # LangGraph workflow definition
└── README.md                   # This file
```

## The 6-Agent Pipeline

1. **Classifier Agent**: Determines the input type (e.g., scam email, rental listing) and initial risk category.
2. **Entity Extractor**: Pulls out verifiable tokens (organizations, urls, names).
3. **OSINT Researcher**: Hits APIs and Tavily across entities. *(Runs in parallel with Forensic Analyst)*
4. **Forensic Analyst**: Looks for discrepancies in content/pricing vs patterns.
5. **Persuasion Detector**: Detects psychological manipulation (scarcity, authority impersonation, etc).
6. **Verdict Synthesizer**: Produces a 0–100 trust score based on weighted flags and offers actionable insights.

## Development

- Start by setting up the API connections in `core/llm.py`
- Initialize the state in `core/state.py`
- Test individual agent prompts via `agent.py` in each folder before integrating into `graph.py`
