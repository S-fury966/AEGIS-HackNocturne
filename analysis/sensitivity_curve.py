import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class SensitivityAnalyzer:

    def __init__(self, similarity_model):
        self.model = similarity_model


    def compute_curve(self, base_prompt, perturbed_prompts, responses):

        base_emb = self.model.embed([base_prompt])
        prompt_embs = self.model.embed(perturbed_prompts)

        response_embs = self.model.embed(responses)

        distances = []
        divergences = []

        for i in range(len(perturbed_prompts)):

            # semantic distance between base prompt and perturbed prompt
            sim = cosine_similarity(base_emb, [prompt_embs[i]])[0][0]
            distance = 1 - sim

            # divergence between this response and others
            sims = cosine_similarity([response_embs[i]], response_embs)[0]

            divergence = 1 - np.mean(sims)

            distances.append(distance)
            divergences.append(divergence)

        return distances, divergences
