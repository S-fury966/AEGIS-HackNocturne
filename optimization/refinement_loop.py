import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from optimization.strategy_selector import StrategySelector
from optimization.prompt_optimizer import PromptOptimizer

from perturbations.paraphrase import paraphrase
from perturbations.emotional import emotional
from perturbations.structural import structural
from perturbations.logical_flip import logical_flip
from perturbations.reasoning import reasoning

from analysis.graph_analyzer import GraphAnalyzer
from analysis.hallucination_detector import HallucinationDetector
from analysis.confidence_estimator import ConfidenceEstimator
from analysis.stability_analyzer import StabilityAnalyzer


class RefinementLoop:

    def __init__(self, llm, similarity_model):

        self.llm = llm
        self.similarity_model = similarity_model

        self.strategy_selector = StrategySelector()
        self.prompt_optimizer = PromptOptimizer(llm)

        self.graph_analyzer = GraphAnalyzer()
        self.hallucination_detector = HallucinationDetector(similarity_model)
        self.confidence_estimator = ConfidenceEstimator()
        self.stability_analyzer = StabilityAnalyzer()

    def run(self, original_prompt, diagnosis):

        strategies = self.strategy_selector.select(diagnosis["weaknesses"])
        candidates = self.prompt_optimizer.optimize(original_prompt, strategies)

        # evaluate all candidates silently, pick the best

        best_candidate = None
        best_scores = None
        best_responses = None
        best_combined = -1

        for candidate in candidates:

            scores, responses = self._full_evaluate(candidate)

            if scores["final_stability"] > best_combined:
                best_combined = scores["final_stability"]
                best_candidate = candidate
                best_scores = scores
                best_responses = responses

        original_scores = diagnosis["scores"]
        improvement = best_scores["final_stability"] - original_scores["final_stability"]

        # =========================================
        # SECTION 1: ORIGINAL PROMPT STABILITY
        # =========================================

        print("\n==============================")
        print("ORIGINAL PROMPT — STABILITY METRICS")
        print("==============================\n")

        print(f"  Prompt: {original_prompt}\n")
        print(f"  Similarity Score:      {original_scores['similarity']:.3f}")
        print(f"  Graph Stability:       {original_scores['graph_stability']:.3f}")
        print(f"  Hallucination Risk:    {original_scores['hallucination_risk']:.3f}")
        print(f"  Confidence Score:      {original_scores['confidence']:.3f}")
        print(f"  Final Stability:       {original_scores['final_stability']:.3f}")

        # =========================================
        # SECTION 2: ORIGINAL vs HEALED COMPARISON
        # =========================================

        print("\n==============================")
        print("ORIGINAL vs HEALED — COMPARISON")
        print("==============================\n")

        print(f"  {'Metric':<25} {'Original':>10} {'Healed':>10} {'Delta':>10}")
        print(f"  {'-' * 57}")

        metrics = [
            ("Similarity",         "similarity"),
            ("Graph Stability",    "graph_stability"),
            ("Hallucination Risk", "hallucination_risk"),
            ("Confidence",         "confidence"),
            ("Final Stability",    "final_stability")
        ]

        for label, key in metrics:

            orig_val = original_scores[key]
            opt_val = best_scores[key]

            if key == "hallucination_risk":
                delta = orig_val - opt_val
            else:
                delta = opt_val - orig_val

            delta_str = f"+{delta:.3f}" if delta >= 0 else f"{delta:.3f}"

            print(f"  {label:<25} {orig_val:>10.3f} {opt_val:>10.3f} {delta_str:>10}")

        print()

        if improvement > 0:
            print(f"  >> Stability IMPROVED by +{improvement:.3f}")
        else:
            print(f"  >> No improvement — original prompt is already near-optimal")

        # =========================================
        # SECTION 3: HEALED PROMPT + RESPONSE
        # =========================================

        print("\n==============================")
        print("HEALED PROMPT")
        print("==============================\n")

        print(f"  Original:  {original_prompt}")
        print(f"  Healed:    {best_candidate}")

        print("\n  --- LLM Response to Healed Prompt ---\n")

        for i, resp in enumerate(best_responses):
            print(f"  Response {i+1}:")
            print(f"  {resp}")
            print()

        return {
            "original_prompt": original_prompt,
            "healed_prompt": best_candidate,
            "original_scores": original_scores,
            "healed_scores": best_scores,
            "healed_responses": best_responses,
            "improvement": improvement
        }


    def _full_evaluate(self, prompt):

        # generate responses from the LLM
        responses = self.llm.generate(prompt, n=3)

        # similarity score
        embeddings = self.similarity_model.embed(responses)
        similarity_score, _ = self.similarity_model.similarity_score(embeddings)

        # graph stability
        graph = self.graph_analyzer.build_graph(prompt, responses)
        graph_score = self.graph_analyzer.graph_stability(graph)

        # hallucination risk
        hallucination_risk = self.hallucination_detector.detect(responses)

        # confidence
        confidence_score = self.confidence_estimator.compute(
            similarity_score, graph_score, hallucination_risk
        )

        # final stability
        final_score = self.stability_analyzer.final_score(
            similarity_score, graph_score, hallucination_risk
        )

        scores = {
            "similarity": float(similarity_score),
            "graph_stability": float(graph_score),
            "hallucination_risk": float(hallucination_risk),
            "confidence": float(confidence_score),
            "final_stability": float(final_score)
        }

        return scores, responses


    def _build_explanation(self, original_scores, optimized_scores, weaknesses, strategies):

        reasons = []

        # --- Similarity ---

        sim_delta = optimized_scores["similarity"] - original_scores["similarity"]

        if sim_delta > 0.05:
            reasons.append(
                f"CONSISTENCY IMPROVED (+{sim_delta:.3f}): The optimized prompt "
                f"produces more consistent responses across runs. The LLM's outputs "
                f"are now more semantically aligned with each other, meaning the "
                f"prompt leaves less room for interpretation."
            )
        elif sim_delta < -0.05:
            reasons.append(
                f"CONSISTENCY DECREASED ({sim_delta:.3f}): Response similarity dropped "
                f"slightly, but this may be acceptable if other metrics improved."
            )

        # --- Hallucination Risk ---

        hall_delta = original_scores["hallucination_risk"] - optimized_scores["hallucination_risk"]

        if hall_delta > 0.05:
            reasons.append(
                f"HALLUCINATION RISK REDUCED (+{hall_delta:.3f}): The optimized prompt "
                f"is less likely to cause the model to generate conflicting or fabricated "
                f"information. By adding specificity and constraints, the model stays "
                f"grounded in factual responses."
            )
        elif hall_delta < -0.05:
            reasons.append(
                f"HALLUCINATION RISK INCREASED ({hall_delta:.3f}): The model showed "
                f"slightly more divergent responses, but overall stability may still "
                f"be better."
            )

        # --- Graph Stability ---

        graph_delta = optimized_scores["graph_stability"] - original_scores["graph_stability"]

        if graph_delta > 0.03:
            reasons.append(
                f"STRUCTURAL STABILITY IMPROVED (+{graph_delta:.3f}): The knowledge "
                f"graph built from responses is more balanced. This means the model "
                f"is producing more structurally coherent answers."
            )

        # --- Confidence ---

        conf_delta = optimized_scores["confidence"] - original_scores["confidence"]

        if conf_delta > 0.05:
            reasons.append(
                f"MODEL CONFIDENCE INCREASED (+{conf_delta:.3f}): The combined "
                f"confidence metric improved, indicating the model is more certain "
                f"and reliable when responding to the optimized prompt."
            )

        # --- Weakness-specific explanations ---

        weakness_explanations = {
            "high_hallucination": (
                "The original prompt was PRONE TO HALLUCINATION — the model generated "
                "conflicting facts across runs. The optimized prompt adds constraints "
                "that anchor the model to verifiable information."
            ),
            "low_similarity": (
                "The original prompt was AMBIGUOUS — the model interpreted it differently "
                "each time, producing inconsistent answers. The optimized prompt is more "
                "specific and self-contained, reducing room for misinterpretation."
            ),
            "fragile_paraphrase": (
                "The original prompt was FRAGILE TO PARAPHRASING — even slight rewordings "
                "caused different answers. The optimized prompt uses precise terminology "
                "that preserves meaning regardless of phrasing."
            ),
            "fragile_emotional": (
                "The original prompt was SENSITIVE TO EMOTIONAL FRAMING — adding emotional "
                "context changed the answer. The optimized prompt is neutrally framed "
                "to resist emotional bias."
            ),
            "fragile_structural": (
                "The original prompt was SENSITIVE TO STRUCTURAL CHANGES — reformatting "
                "the question changed the answer. The optimized prompt uses a clear, "
                "direct structure that is robust to rearrangement."
            ),
            "fragile_logical_flip": (
                "The original prompt was VULNERABLE TO LOGICAL INVERSION — asking the "
                "opposite question confused the model. The optimized prompt explicitly "
                "anchors the expected direction of the answer."
            ),
            "fragile_reasoning": (
                "The original prompt was WEAK UNDER REASONING PRESSURE — asking for "
                "step-by-step logic changed the answer. The optimized prompt is "
                "structured to handle reasoning-style queries consistently."
            ),
            "low_graph_stability": (
                "The original prompt produced STRUCTURALLY UNBALANCED responses — "
                "the knowledge graph showed high variance. The optimized prompt "
                "constrains the response format for more balanced output."
            ),
            "low_confidence": (
                "The original prompt had LOW MODEL CONFIDENCE — the combined metrics "
                "indicated unreliable outputs. The optimized prompt improves clarity "
                "to boost model certainty."
            )
        }

        for w in weaknesses:
            if w in weakness_explanations:
                reasons.append(weakness_explanations[w])

        if not reasons:
            reasons.append(
                "The optimized prompt applies general clarity and specificity "
                "improvements to make it more robust for LLM evaluation."
            )

        return reasons
