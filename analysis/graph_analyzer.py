import networkx as nx
import numpy as np


class GraphAnalyzer:

    def build_graph(self, prompt, responses):

        G = nx.Graph()

        G.add_node(prompt)

        for r in responses:

            G.add_node(r)

            G.add_edge(prompt, r)

        return G

    def graph_stability(self, graph):

        degrees = []

        for node in graph.nodes():

            degrees.append(graph.degree[node])

        degrees = np.array(degrees)

        variance = np.var(degrees)

        stability = 1 / (1 + variance)

        return stability