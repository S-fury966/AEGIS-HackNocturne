import time
from perturbations.paraphrase import paraphrase
from perturbations.emotional import emotional
from perturbations.structural import structural
from perturbations.logical_flip import logical_flip
from perturbations.reasoning import reasoning
from optimization.token_refinement_loop import TokenRefinementLoop

# Keep your helper functions
def interpret_score(score):
    if score >= 0.8: return "Excellent"
    elif score >= 0.6: return "Good"
    elif score >= 0.4: return "Moderate"
    else: return "Poor"

def interpret_hallucination(score):
    if score == 0: return "No hallucination detected"
    elif score < 0.2: return "Low hallucination risk"
    elif score < 0.5: return "Moderate hallucination risk"
    else: return "High hallucination risk"

# The new service function
def run_stability_analysis(
    prompt: str, 
    llm_interface, 
    similarity_model, 
    graph_analyzer, 
    hallucination_detector, 
    confidence_estimator, 
    stability_analyzer
):
    start_time = time.time()

    """
    Runs the full LLM stability pipeline for a given prompt and returns a dictionary of results.
    """
    
    # 1. Prompt Perturbation
    prompts = []
    prompts.extend(paraphrase(prompt))
    prompts.extend(emotional(prompt))
    prompts.extend(structural(prompt))
    prompts.extend(logical_flip(prompt))
    prompts.extend(reasoning(prompt))
    prompts = list(set(prompts))[:12]

    # 2. LLM Generation
    responses = []
    for p in prompts:
        outputs = llm_interface.generate(p, n=1)
        responses.extend(outputs)

    # 3. Similarity
    embeddings = similarity_model.embed(responses)
    similarity_score, similarity_matrix = similarity_model.similarity_score(embeddings)

    # 4. Graph Stability
    graph = graph_analyzer.build_graph(prompt, responses)
    graph_score = graph_analyzer.graph_stability(graph)

    # 5. Hallucination Detection
    hallucination_risk = hallucination_detector.detect(responses)

    # 6. Confidence & Final Scores
    confidence_score = confidence_estimator.compute(similarity_score, graph_score, hallucination_risk)
    final_score = stability_analyzer.final_score(similarity_score, graph_score, hallucination_risk)

    token_refinement = TokenRefinementLoop(llm_interface, similarity_model)
    token_optimization = token_refinement.run(
        prompt,
        {
            "similarity": float(similarity_score),
            "graph_stability": float(graph_score),
            "hallucination_risk": float(hallucination_risk),
            "confidence": float(confidence_score),
            "final_stability": float(final_score)
        }
    )

    # Calculate individual prompt scores for the frontend scatter plot
    prompt_scores = []
    emb_responses = similarity_model.embed(responses)
    for p in prompts:
        emb_prompt = similarity_model.embed([p])
        sim = (emb_prompt @ emb_responses.T).mean()
        prompt_scores.append(float(sim))

    end_time = time.time() # 3. END THE TIMER HERE
    execution_time = round(end_time - start_time, 2)

    # 7. Package everything into a dictionary to send back to the React frontend
    return {
        "execution_time": execution_time,
        "original_prompt": prompt,
        "perturbed_prompts": prompts,
        "responses": responses,
        "metrics": {
            # Cast numpy numbers to native Python floats so FastAPI can serialize them
            "similarity_score": round(float(similarity_score), 3),
            "similarity_interpretation": interpret_score(similarity_score),
            
            "graph_score": round(float(graph_score), 3),
            "graph_interpretation": interpret_score(graph_score),
            
            "hallucination_risk": round(float(hallucination_risk), 3),
            "hallucination_interpretation": interpret_hallucination(hallucination_risk),
            
            "confidence_score": round(float(confidence_score), 3),
            "confidence_interpretation": interpret_score(confidence_score),
            
            "final_score": round(float(final_score), 3),
            "final_interpretation": interpret_score(final_score)
        },
        "visualization_data": {
            "similarity_matrix": similarity_matrix.tolist(), 
            "prompt_scores": prompt_scores
        },
        "token_optimization": token_optimization
    }
