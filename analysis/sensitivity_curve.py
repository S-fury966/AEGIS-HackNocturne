import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class SensitivityAnalyzer:

    def __init__(self, similarity_model):
        self.model = similarity_model

    def prompt_distances(self, base_prompt, perturbed_prompts):

        base_emb = self.model.embed([base_prompt])

        pert_emb = self.model.embed(perturbed_prompts)

        sims = cosine_similarity(base_emb, pert_emb)[0]

        distances = 1 - sims

        return distances


    def response_divergence(self, responses):

        emb = self.model.embed(responses)

        sim_matrix = cosine_similarity(emb)

        mean_sim = sim_matrix[np.triu_indices_from(sim_matrix, k=1)].mean()

        divergence = 1 - mean_sim

        return divergence


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