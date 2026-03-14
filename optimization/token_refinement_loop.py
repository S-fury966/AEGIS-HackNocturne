from optimization.token_optimizer import TokenOptimizer

from analysis.graph_analyzer import GraphAnalyzer
from analysis.hallucination_detector import HallucinationDetector
from analysis.confidence_estimator import ConfidenceEstimator
from analysis.stability_analyzer import StabilityAnalyzer


class TokenRefinementLoop:

    def __init__(self, llm, similarity_model, stability_threshold=0.90):

        self.llm = llm
        self.similarity_model = similarity_model
        self.stability_threshold = stability_threshold

        self.token_optimizer = TokenOptimizer(llm)

        self.graph_analyzer = GraphAnalyzer()
        self.hallucination_detector = HallucinationDetector(similarity_model)
        self.confidence_estimator = ConfidenceEstimator()
        self.stability_analyzer = StabilityAnalyzer()

    def run(self, original_prompt, original_scores):

        original_stability_score = original_scores["final_stability"]
        original_tokens = self.llm.count_tokens(original_prompt)

        candidates = self.token_optimizer.optimize(original_prompt)

        if not candidates:
            candidates = [original_prompt]

        results = []

        for candidate in candidates:

            candidate_tokens = self.llm.count_tokens(candidate)
            scores, responses = self._full_evaluate(candidate)

            stability = scores["final_stability"]
            stability_ratio = stability / original_stability_score if original_stability_score > 0 else 0
            efficiency = stability * (original_tokens / candidate_tokens) if candidate_tokens > 0 else 0

            results.append({
                "prompt": candidate,
                "tokens": candidate_tokens,
                "scores": scores,
                "responses": responses,
                "stability": stability,
                "stability_ratio": stability_ratio,
                "efficiency": efficiency
            })

        min_stability = original_stability_score * self.stability_threshold
        shorter_candidates = [r for r in results if r["tokens"] < original_tokens]
        stable_shorter = [r for r in shorter_candidates if r["stability"] >= min_stability]

        optimization_applied = len(stable_shorter) > 0
        threshold_met = optimization_applied

        if optimization_applied:
            best = max(stable_shorter, key=lambda r: r["efficiency"])
            message = "Stable token-optimized prompt generated."
        else:
            best = {
                "prompt": None,
                "tokens": original_tokens,
                "scores": original_scores,
                "responses": [],
                "stability": original_stability_score,
                "stability_ratio": 1.0,
                "efficiency": 0.0
            }
            message = "Stability of response will decrease if tokens get reduced."

        token_savings = original_tokens - best["tokens"]
        savings_pct = (token_savings / original_tokens * 100) if original_tokens > 0 else 0

        print("\n==============================")
        print("TOKEN-OPTIMIZED PROMPT")
        print("==============================\n")

        print(f"  Original Prompt:    {original_prompt}")
        print(f"  Original Tokens:    {original_tokens}")
        print(f"  Original Stability: {original_stability_score:.3f}\n")

        if optimization_applied:
            print(f"  Optimized Prompt:   {best['prompt']}")
            print(f"  Optimized Tokens:   {best['tokens']}")
            print(f"  Optimized Stability:{best['stability']:.3f}\n")
        else:
            print("  Optimized Prompt:   Not generated")
            print(f"  Optimized Tokens:   {original_tokens}")
            print(f"  Optimized Stability:{original_stability_score:.3f}\n")

        print(f"  Token Savings:      {token_savings} tokens ({savings_pct:.1f}%)")
        print(f"  Efficiency Score:   {best['efficiency']:.3f}")

        if not optimization_applied:
            print(f"\n  Warning: {message}")
            print(f"  Required minimum stability: {min_stability:.3f}")

        print(f"\n  {'Metric':<25} {'Original':>10} {'Optimized':>10} {'Delta':>10}")
        print(f"  {'-' * 57}")

        metrics = [
            ("Similarity", "similarity"),
            ("Graph Stability", "graph_stability"),
            ("Hallucination Risk", "hallucination_risk"),
            ("Confidence", "confidence"),
            ("Final Stability", "final_stability")
        ]

        for label, key in metrics:

            orig_val = original_scores[key]
            opt_val = best["scores"][key]

            if key == "hallucination_risk":
                delta = orig_val - opt_val
            else:
                delta = opt_val - orig_val

            delta_str = f"+{delta:.3f}" if delta >= 0 else f"{delta:.3f}"
            print(f"  {label:<25} {orig_val:>10.3f} {opt_val:>10.3f} {delta_str:>10}")

        print(f"\n  {'Tokens':<25} {original_tokens:>10} {best['tokens']:>10} {f'-{token_savings}':>10}")

        if optimization_applied:
            print("\n  --- LLM Response to Optimized Prompt ---\n")

            for i, resp in enumerate(best["responses"]):
                print(f"  Response {i+1}:")
                print(f"  {resp}")
                print()

        return {
            "original_prompt": original_prompt,
            # Fallback to the original prompt if no optimization was applied
            "optimized_prompt": best["prompt"] if best["prompt"] else original_prompt,
            "original_tokens": original_tokens,
            "optimized_tokens": best["tokens"],
            "token_savings": token_savings,
            "savings_pct": savings_pct,
            "original_stability": original_stability_score,
            "optimized_stability": best["stability"],
            "efficiency_score": best["efficiency"],
            "optimized_responses": best["responses"],
            "threshold_met": threshold_met,
            "optimization_applied": optimization_applied,
            "message": message,
            
            # --- ADDED FOR FRONTEND INTEGRATION (STEP 2) ---
            "new_final_score": best["scores"]["final_stability"],
            "new_similarity": best["scores"]["similarity"],
            "new_hallucination_risk": best["scores"]["hallucination_risk"]
        }

    def _full_evaluate(self, prompt):

        responses = self.llm.generate(prompt, n=3)

        embeddings = self.similarity_model.embed(responses)
        similarity_score, _ = self.similarity_model.similarity_score(embeddings)

        graph = self.graph_analyzer.build_graph(prompt, responses)
        graph_score = self.graph_analyzer.graph_stability(graph)

        hallucination_risk = self.hallucination_detector.detect(responses)

        confidence_score = self.confidence_estimator.compute(
            similarity_score, graph_score, hallucination_risk
        )

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
