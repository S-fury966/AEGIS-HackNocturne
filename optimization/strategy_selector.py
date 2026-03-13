class StrategySelector:

    STRATEGY_MAP = {

        "low_similarity": (
            "Add more context and specificity to reduce ambiguity. "
            "Make the core question self-contained with clear scope."
        ),

        "high_hallucination": (
            "Add explicit constraints like 'only state verified facts' "
            "and 'if unsure, say you are not certain'. "
            "Request sources or reasoning to anchor the response."
        ),

        "low_graph_stability": (
            "Restructure the prompt to have a single clear directive. "
            "Avoid compound questions that can be interpreted in multiple ways."
        ),

        "low_confidence": (
            "Make the expected output format explicit. "
            "Add boundaries like 'answer in 2-3 sentences' to constrain the response."
        ),

        "fragile_paraphrase": (
            "Make the core question highly explicit and self-contained "
            "so that paraphrasing cannot change its meaning. "
            "Use precise terminology instead of casual language."
        ),

        "fragile_emotional": (
            "Frame the question in a neutral, objective tone. "
            "Remove any emotional framing and focus on the factual query."
        ),

        "fragile_structural": (
            "Use a clear, standard question structure. "
            "Avoid open-ended phrasing; be direct about what information is needed."
        ),

        "fragile_logical_flip": (
            "State the expected answer direction explicitly to anchor the response. "
            "Add context that prevents the question from being logically inverted."
        ),

        "fragile_reasoning": (
            "Specify the type of reasoning expected. "
            "Ask for step-by-step explanation to force structured thinking."
        )
    }

    def select(self, weaknesses):

        strategies = []

        for weakness in weaknesses:

            if weakness in self.STRATEGY_MAP:
                strategies.append(self.STRATEGY_MAP[weakness])

        # fallback if no specific strategies matched
        if not strategies:
            strategies.append(
                "Improve clarity, add specificity, and reduce ambiguity "
                "in the prompt to make it more robust."
            )

        return strategies
