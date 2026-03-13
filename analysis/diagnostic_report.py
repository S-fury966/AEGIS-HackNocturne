class DiagnosticReport:

    def __init__(self, similarity_score, graph_score, hallucination_risk,
                 confidence_score, final_score, fragility_scores):

        self.similarity_score = similarity_score
        self.graph_score = graph_score
        self.hallucination_risk = hallucination_risk
        self.confidence_score = confidence_score
        self.final_score = final_score
        self.fragility_scores = fragility_scores

    def diagnose(self):

        weaknesses = []

        # --- Check global metrics ---

        if self.similarity_score < 0.6:
            weaknesses.append("low_similarity")

        if self.hallucination_risk > 0.4:
            weaknesses.append("high_hallucination")

        if self.graph_score < 0.5:
            weaknesses.append("low_graph_stability")

        if self.confidence_score < 0.5:
            weaknesses.append("low_confidence")

        # --- Check per-perturbation fragility ---

        fragility_threshold = 0.3

        for ptype, score in self.fragility_scores.items():

            if score > fragility_threshold:
                weaknesses.append(f"fragile_{ptype}")

        # --- Determine severity ---

        if self.final_score < 0.4 or len(weaknesses) >= 4:
            severity = "critical"

        elif self.final_score < 0.6 or len(weaknesses) >= 2:
            severity = "moderate"

        elif len(weaknesses) >= 1:
            severity = "mild"

        else:
            severity = "none"

        is_fragile = self.final_score < 0.6 or len(weaknesses) >= 2

        return {
            "is_fragile": is_fragile,
            "weaknesses": weaknesses,
            "severity": severity,
            "fragility_breakdown": self.fragility_scores,
            "scores": {
                "similarity": self.similarity_score,
                "graph_stability": self.graph_score,
                "hallucination_risk": self.hallucination_risk,
                "confidence": self.confidence_score,
                "final_stability": self.final_score
            }
        }
