import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity


class GraphAnalyzer:

    SIMILARITY_THRESHOLD = 0.6

    def build_graph(self, responses, embeddings, threshold=None):

        if threshold is None:
            threshold = self.SIMILARITY_THRESHOLD

        G = nx.Graph()

        # one node per response, keyed by index so duplicate strings never merge
        G.add_nodes_from(range(len(responses)))

        if len(responses) < 2:
            return G

        sim_matrix = cosine_similarity(embeddings)

        for i in range(len(responses)):
            for j in range(i + 1, len(responses)):
                if sim_matrix[i][j] >= threshold:
                    G.add_edge(i, j)

        return G

    def graph_stability(self, graph):

        n = graph.number_of_nodes()

        if n == 0:
            return 0.0

        if n == 1:
            return 1.0

        largest = max(len(c) for c in nx.connected_components(graph))

        return largest / n
