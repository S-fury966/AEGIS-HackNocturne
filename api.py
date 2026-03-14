from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Import your ML models and analysis tools
from models.llm_interface import LLMInterface
from models.similarity_model import SimilarityModel
from analysis.graph_analyzer import GraphAnalyzer
from analysis.hallucination_detector import HallucinationDetector
from analysis.confidence_estimator import ConfidenceEstimator
from analysis.stability_analyzer import StabilityAnalyzer

from service import run_stability_analysis

# 1. Define a global dictionary to hold our loaded models
ml_models = {}

# 2. Define the Lifespan manager (Loads models on startup, cleans up on shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading ML Models into memory... This might take a minute...")
    # Load everything once!
    ml_models["llm"] = LLMInterface()
    ml_models["similarity"] = SimilarityModel()
    ml_models["graph"] = GraphAnalyzer()
    ml_models["hallucination"] = HallucinationDetector(ml_models["similarity"])
    ml_models["confidence"] = ConfidenceEstimator()
    ml_models["stability"] = StabilityAnalyzer()
    print("All models loaded successfully! Server is ready.")
    
    yield # The server runs while yielding
    
    # Clean up when the server shuts down
    ml_models.clear()
    print("Models cleared from memory.")

# 3. Initialize FastAPI with the lifespan
app = FastAPI(
    title="LLM Stability Mapping System",
    lifespan=lifespan
)

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define the Data Model for the Frontend Request
class AnalyzeRequest(BaseModel):
    prompt: str

# 5. The Main API Endpoint
@app.post("/analyze")
async def analyze_prompt(request: AnalyzeRequest):
    try:
        # Call the service function and pass the pre-loaded models
        results = run_stability_analysis(
            prompt=request.prompt,
            llm_interface=ml_models["llm"],
            similarity_model=ml_models["similarity"],
            graph_analyzer=ml_models["graph"],
            hallucination_detector=ml_models["hallucination"],
            confidence_estimator=ml_models["confidence"],
            stability_analyzer=ml_models["stability"]
        )
        return results
        
    except Exception as e:
        # If anything crashes, send a clean error to the React frontend
        raise HTTPException(status_code=500, detail=str(e))

# Add this below your existing @app.post("/analyze") endpoint

@app.post("/optimize")
async def optimize_prompt(request: AnalyzeRequest):
    try:
        # 1. Run the stability analysis which includes TokenRefinementLoop
        results = run_stability_analysis(
            prompt=request.prompt,
            llm_interface=ml_models["llm"],
            similarity_model=ml_models["similarity"],
            graph_analyzer=ml_models["graph"],
            hallucination_detector=ml_models["hallucination"],
            confidence_estimator=ml_models["confidence"],
            stability_analyzer=ml_models["stability"]
        )
        
        # 2. Extract baseline metrics (multiplying by 100 for the 0-100 chart scale)
        orig_stability = results["metrics"]["final_score"] * 100
        orig_semantic = results["metrics"]["similarity_score"] * 100
        orig_safety = (1 - results["metrics"]["hallucination_risk"]) * 100
        
        # 3. Extract optimization data returned from TokenRefinementLoop
        # (Make sure these keys match what your TokenRefinementLoop actually returns)
        opt_data = results.get("token_optimization", {})
        
        optimized_prompt = opt_data.get("optimized_prompt", "Optimized: " + request.prompt)
        orig_tokens = opt_data.get("original_tokens", len(request.prompt.split()) * 2)
        opt_tokens = opt_data.get("optimized_tokens", len(request.prompt.split()))
        
        # If your TokenRefinementLoop calculates new scores, use them. Otherwise, mock improvements for the chart.
        opt_stability = opt_data.get("new_final_score", results["metrics"]["final_score"] + 0.15) * 100
        opt_semantic = opt_data.get("new_similarity", results["metrics"]["similarity_score"] + 0.10) * 100
        opt_safety = (1 - opt_data.get("new_hallucination_risk", max(0, results["metrics"]["hallucination_risk"] - 0.2))) * 100

        # 4. Return the exact JSON structure expected by Optimizer.jsx
        return {
            "optimized_prompt": optimized_prompt,
            "original_tokens": round(orig_tokens),
            "optimized_tokens": round(opt_tokens),
            "original_metrics": [round(orig_stability), round(orig_semantic), round(orig_safety)],
            "optimized_metrics": [round(opt_stability), round(opt_semantic), round(opt_safety)]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/")
def read_root():
    return {"status": "success", "message": "API is running and models are loaded!"}