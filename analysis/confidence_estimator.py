class ConfidenceEstimator:

    def compute(self, similarity, graph_score, hallucination):

        confidence = (
            0.5 * similarity +
            0.3 * graph_score +
            0.2 * (1 - hallucination)
        )

        return confidence