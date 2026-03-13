import numpy as np


class FragilityAnalyzer:

    def compute(self, prompt_types, divergences):

        results = {}

        for ptype, div in zip(prompt_types, divergences):

            if ptype not in results:
                results[ptype] = []

            results[ptype].append(div)

        fragility_scores = {
            k: float(np.mean(v)) for k, v in results.items()
        }

        return fragility_scores