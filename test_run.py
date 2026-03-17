import json
import os
import argparse
from dotenv import load_dotenv
from agents.graph import build_trust_pipeline
from langchain_core.messages import HumanMessage

# Load environment variables (.env)
load_dotenv()

def run_test(sample_text: str):
    print("=" * 60)
    print("🚀 INITIALIZING TRUSTCHECK AI")
    print("=" * 60)
    print(f"INPUT:\n{sample_text}\n")
    print("-" * 60)
    
    # 1. Build the LangGraph Application
    app = build_trust_pipeline()
    
    # 2. Initialize State
    initial_state = {
        "input_content": sample_text,
        "messages": [HumanMessage(content=sample_text)]
    }
    
    # 3. Stream through the nodes (Agents)
    print("Starting Multi-Agent Verification Pipeline...\n")
    try:
        for output in app.stream(initial_state, {"recursion_limit": 10}):
            # The output resolves as a dict with the node name as the key
            for node_name, state_update in output.items():
                print(f"✅ [{node_name}] completed.")
                
                # Optional: print summary of what that agent found
                if node_name == "Classifier":
                     print(f"   -> Detected: {state_update.get('content_type')} | Risk: {state_update.get('initial_risk_level')}")
                elif node_name == "Synthesizer":
                     print(f"   -> Trust Score: {state_update.get('trust_score')}/100")
        
        # 4. Final Final Result (Grab the final merged state)
        # Note: LangGraph's .invoke() returns the final state instead of streaming, 
        # but since we streamed, we can just grab the last synthesizer output.
        print("\n" + "=" * 60)
        print("📊 FINAL VERDICT")
        print("=" * 60)
        print(f"Score: {state_update.get('trust_score', 'N/A')}/100")
        print(f"Verdict: {state_update.get('final_verdict', 'N/A')}")
        print(f"Advice: {state_update.get('recommendation', 'N/A')}")
        
    except Exception as e:
        print(f"\n❌ Error encountered during execution: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the NEMOTRON TrustCheck Agents")
    parser.add_argument("--file", type=str, help="Path to a text file to analyze")
    parser.add_argument("--sample", action="store_true", help="Run the default rental scam sample")
    args = parser.parse_args()
    
    if args.file:
        with open(args.file, "r") as f:
            content = f.read()
        run_test(content)
    elif args.sample:
        with open("data/raw/rental_scam.txt", "r") as f:
            content = f.read()
        run_test(content)
    else:
        # Load the JSON and prompt the user to pick one
        if os.path.exists("data/samples.json"):
             with open("data/samples.json", "r") as f:
                 samples = json.load(f)
             print("Select a sample to run:")
             for i, sample in enumerate(samples):
                 print(f"[{i}] {sample['id']} ({sample['type']})")
             
             choice = input("\nEnter sample number: ")
             try:
                 idx = int(choice)
                 selected = samples[idx]["content"]
                 run_test(selected)
             except (ValueError, IndexError):
                 print("Invalid selection.")
        else:
             print("No data found. Please run with --sample to use the default.")
