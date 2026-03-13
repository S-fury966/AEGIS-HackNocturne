import matplotlib.pyplot as plt
import numpy as np


def plot_sensitivity_curve(distances, divergences):

    plt.figure(figsize=(6,4))

    plt.scatter(distances, divergences, color="red")

    if len(distances) > 1:

        z = np.polyfit(distances, divergences, 1)
        p = np.poly1d(z)

        x = np.linspace(min(distances), max(distances), 100)

        plt.plot(x, p(x), linestyle="--")

    plt.xlabel("Prompt Semantic Distance")
    plt.ylabel("Response Divergence")

    plt.title("LLM Sensitivity Curve")

    plt.grid(True)

    plt.show()