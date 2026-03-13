import seaborn as sns
import matplotlib.pyplot as plt


def plot_heatmap(matrix):

    plt.figure(figsize=(8,6))

    sns.heatmap(matrix, cmap="coolwarm")

    plt.title("LLM Response Similarity Heatmap")

    plt.xlabel("Responses")

    plt.ylabel("Responses")

    plt.show()