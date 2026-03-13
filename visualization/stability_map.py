import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sentence_transformers import SentenceTransformer
import numpy as np
import torch


class StabilityMap:

    def __init__(self):

        device = "cuda" if torch.cuda.is_available() else "cpu"

        self.embedder = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device=device
        )

    def plot(self, prompts, stability_scores):

        embeddings = self.embedder.encode(prompts)

        pca = PCA(n_components=2)

        reduced = pca.fit_transform(embeddings)

        x = reduced[:, 0]
        y = reduced[:, 1]

        colors = np.array(stability_scores)

        plt.figure(figsize=(8, 6))

        scatter = plt.scatter(
            x,
            y,
            c=colors,
            cmap="viridis",
            s=150
        )

        for i, prompt in enumerate(prompts):

            short = prompt[:35] + "..." if len(prompt) > 35 else prompt

            plt.text(
                x[i],
                y[i],
                str(i + 1),
                fontsize=9
            )

        plt.colorbar(scatter, label="Prompt Stability Score")

        plt.title("LLM Stability Map")

        plt.xlabel("Semantic Dimension 1")
        plt.ylabel("Semantic Dimension 2")

        plt.show()