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

# Health check endpoint
@app.get("/")
def read_root():
    return {"status": "success", "message": "API is running and models are loaded!"}