import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class HallucinationDetector:

    def __init__(self, similarity_model):
        self.model = similarity_model


    def detect(self, responses):

        embeddings = self.model.embed(responses)

        sim_matrix = cosine_similarity(embeddings)

        # ignore diagonal
        upper = sim_matrix[np.triu_indices_from(sim_matrix, k=1)]

        mean_similarity = np.mean(upper)

        hallucination_risk = 1 - mean_similarity

        return float(hallucination_risk)