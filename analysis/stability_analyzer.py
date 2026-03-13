class StabilityAnalyzer:

    def final_score(self, similarity, graph_score, hallucination):

        score = (
            0.4 * similarity +
            0.3 * graph_score +
            0.3 * (1 - hallucination)
        )

        return score