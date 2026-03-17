from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from agents.graph import build_trust_pipeline
from langchain_core.messages import HumanMessage

# Load env variables
load_dotenv()

app = FastAPI(title="NCheck Trust API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerifyRequest(BaseModel):
    content: str

@app.post("/api/verify")
def verify_content(request: VerifyRequest):
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    
    try:
        pipeline = build_trust_pipeline()
        initial_state = {
            "input_content": request.content,
            "messages": [HumanMessage(content=request.content)]
        }
        
        # Invoke the graph synchronously (FastAPI will run this in a threadpool)
        final_state = pipeline.invoke(initial_state, {"recursion_limit": 10})
        
        return {
            "status": "success",
            "trust_score": final_state.get("trust_score", 0),
            "final_verdict": final_state.get("final_verdict", "No verdict generated."),
            "facts_and_weights": final_state.get("facts_and_weights", []),
            "recommendation": final_state.get("recommendation", ""),
            "plan_of_action": final_state.get("plan_of_action", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Mount the static frontend
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
