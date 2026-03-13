from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class SimilarityModel:

    def __init__(self):

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device="cpu"
        )

    def embed(self, texts):

        return self.model.encode(
            texts,
            batch_size=32,
            convert_to_numpy=True
        )

    def similarity_score(self, embeddings):

        matrix = cosine_similarity(embeddings)

        upper_triangle = matrix[np.triu_indices(len(matrix), 1)]

        score = upper_triangle.mean()

        return score, matrix