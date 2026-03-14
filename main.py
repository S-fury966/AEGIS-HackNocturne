from models.llm_interface import LLMInterface
from models.similarity_model import SimilarityModel

from perturbations.paraphrase import paraphrase
from perturbations.emotional import emotional
from perturbations.structural import structural
from perturbations.logical_flip import logical_flip
from perturbations.reasoning import reasoning

from analysis.graph_analyzer import GraphAnalyzer
from analysis.hallucination_detector import HallucinationDetector
from analysis.confidence_estimator import ConfidenceEstimator
from analysis.stability_analyzer import StabilityAnalyzer

from visualization.heatmap import plot_heatmap
from visualization.stability_map import StabilityMap
from analysis.sensitivity_curve import SensitivityAnalyzer
from visualization.sensitivity_plot import plot_sensitivity_curve
from visualization.landscape_stability import StabilityLandscape

from analysis.fragility_analyzer import FragilityAnalyzer
from analysis.diagnostic_report import DiagnosticReport
from optimization.refinement_loop import RefinementLoop
from optimization.token_refinement_loop import TokenRefinementLoop

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# ----------------------------
# performance interpretation
# ----------------------------
def interpret_score(score):

    if score >= 0.8:
        return "Excellent"

    elif score >= 0.6:
        return "Good"

    elif score >= 0.4:
        return "Moderate"

    else:
        return "Poor"


def interpret_hallucination(score):

    if score == 0:
        return "No hallucination detected"

    elif score < 0.2:
        return "Low hallucination risk"

    elif score < 0.5:
        return "Moderate hallucination risk"

    else:
        return "High hallucination risk"


def main():

    prompt = "Who was the person who drafted the Indian Constitution?"

    print("\n==============================")
    print("Original Prompt:")
    print(prompt)
    print("==============================\n")

    # --------------------------------
    # Prompt Perturbation
    # --------------------------------

    prompt_pairs = []

    prompt_pairs.extend([(p, "paraphrase") for p in paraphrase(prompt)])
    prompt_pairs.extend([(p, "emotional") for p in emotional(prompt)])
    prompt_pairs.extend([(p, "structural") for p in structural(prompt)])
    prompt_pairs.extend([(p, "logical_flip") for p in logical_flip(prompt)])
    prompt_pairs.extend([(p, "reasoning") for p in reasoning(prompt)])

    prompt_pairs = list(set(prompt_pairs))
    prompt_pairs = prompt_pairs[:12]

    prompts = [p[0] for p in prompt_pairs]
    types = [p[1] for p in prompt_pairs]

    print("Generated Perturbed Prompts:\n")

    for i, p in enumerate(prompts):
        print(f"{i+1}. {p}")

    # --------------------------------
    # LLM Generation
    # --------------------------------

    llm = LLMInterface()

    responses = []

    for p in prompts:

        outputs = llm.generate(p, n=1)

        responses.extend(outputs)

    print("\n==============================")
    print("Generated Responses")
    print("==============================\n")

    for i, r in enumerate(responses):
        print(f"Response {i+1}:")
        print(r)
        print()

    # --------------------------------
    # Similarity
    # --------------------------------

    similarity_model = SimilarityModel()

    embeddings = similarity_model.embed(responses)

    similarity_score, similarity_matrix = similarity_model.similarity_score(
        embeddings
    )

    sim_matrix = cosine_similarity(embeddings) ##chenged

    divergences = 1 - sim_matrix.mean(axis=1)
    hallucinations = divergences
# --------------------------------
# Sensitivity Analysis
# --------------------------------

    sensitivity_analyzer = SensitivityAnalyzer(similarity_model)

    distances, divergences = sensitivity_analyzer.compute_curve(prompt,prompts,responses)


    fragility = FragilityAnalyzer()

    fragility_scores = fragility.compute(types, divergences)

    print("\n==============================")
    print("PROMPT FRAGILITY REPORT")
    print("==============================\n")

    for k, v in fragility_scores.items():
        print(f"{k:<15} {round(v,3)}")

    

    # --------------------------------
    # Graph Stability
    # --------------------------------

    graph_analyzer = GraphAnalyzer()

    graph = graph_analyzer.build_graph(prompt, responses)

    graph_score = graph_analyzer.graph_stability(graph)

    # --------------------------------
    # Hallucination Detection
    # --------------------------------

    hallucination_detector = HallucinationDetector(similarity_model)

    hallucination_risk = hallucination_detector.detect(responses)

    # --------------------------------
    # Confidence
    # --------------------------------

    confidence_estimator = ConfidenceEstimator()

    confidence_score = confidence_estimator.compute(
        similarity_score,
        graph_score,
        hallucination_risk
    )

    # --------------------------------
    # Final Stability Score
    # --------------------------------

    stability_analyzer = StabilityAnalyzer()

    final_score = stability_analyzer.final_score(
        similarity_score,
        graph_score,
        hallucination_risk
    )

    # --------------------------------
    # Performance Report
    # --------------------------------

    print("\n==============================")
    print("MODEL PERFORMANCE REPORT")
    print("==============================\n")

    print("Similarity Score:", round(similarity_score, 3))
    print("Performance:", interpret_score(similarity_score), "\n")

    print("Graph Stability Score:", round(graph_score, 3))
    print("Performance:", interpret_score(graph_score), "\n")

    print("Hallucination Risk:", round(hallucination_risk, 3))
    print("Assessment:", interpret_hallucination(hallucination_risk), "\n")

    print("Confidence Score:", round(confidence_score, 3))
    print("Performance:", interpret_score(confidence_score), "\n")

    print("Final Stability Score:", round(final_score, 3))
    print("Overall Model Stability:", interpret_score(final_score))

    # --------------------------------
    # Prompt Optimization (Self-Healing)
    # --------------------------------

    diagnostic = DiagnosticReport(
        similarity_score=similarity_score,
        graph_score=graph_score,
        hallucination_risk=hallucination_risk,
        confidence_score=confidence_score,
        final_score=final_score,
        fragility_scores=fragility_scores
    )

    diagnosis = diagnostic.diagnose()

    if diagnosis["is_fragile"]:

        refinement = RefinementLoop(llm, similarity_model)

        result = refinement.run(prompt, diagnosis)

    else:
        print("\n==============================")
        print("PROMPT OPTIMIZATION")
        print("==============================\n")
        print("Prompt is stable — no optimization needed.")
        print(f"Final Stability Score: {final_score:.3f} (threshold: 0.600)")

    # --------------------------------
    # Token-Optimized Prompt
    # --------------------------------

    token_refinement = TokenRefinementLoop(llm, similarity_model)

    original_scores_dict = {
        "similarity": similarity_score,
        "graph_stability": graph_score,
        "hallucination_risk": hallucination_risk,
        "confidence": confidence_score,
        "final_stability": final_score
    }

    token_result = token_refinement.run(prompt, original_scores_dict)

    # --------------------------------
    # Prompt Stability Scores
    # --------------------------------

    prompt_scores = []

    for p in prompts:

        emb_prompt = similarity_model.embed([p])

        emb_responses = similarity_model.embed(responses)

        sim = (emb_prompt @ emb_responses.T).mean()

        prompt_scores.append(float(sim))

    distances = [1 - s for s in prompt_scores]

    # --------------------------------
    # Visualizations
    # --------------------------------

    print("\nOpening similarity heatmap...\n")

    plot_heatmap(similarity_matrix)

    print("\nOpening stability map...\n")

    stability_map = StabilityMap()

    stability_map.plot(prompts, prompt_scores)

    print("\nOpening sensitivity curve...\n")

    plot_sensitivity_curve(distances, divergences)

    print("\nOpening stability landscape...\n")

    landscape = StabilityLandscape()

    landscape.plot(distances, divergences, hallucinations)


if __name__ == "__main__":
    main()