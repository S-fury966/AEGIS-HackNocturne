import numpy as np
import plotly.graph_objects as go


class StabilityLandscape:

    def plot(self, distances, divergences, hallucinations):

        fig = go.Figure(data=[go.Scatter3d(
            x=distances,
            y=divergences,
            z=hallucinations,
            mode='markers',
            marker=dict(
                size=6,
                color=hallucinations,
                colorscale='Viridis',
                opacity=0.8
            )
        )])

        fig.update_layout(
            title="Prompt Stability Landscape",
            scene=dict(
                xaxis_title="Prompt Semantic Distance",
                yaxis_title="Response Divergence",
                zaxis_title="Hallucination Risk"
            )
        )

        fig.show()