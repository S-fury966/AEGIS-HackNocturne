def logical_flip(prompt):

    prompts = [

        f"Explain why someone might misunderstand {prompt}",

        f"What are common mistakes people make about {prompt}?",

        f"Explain the opposite perspective of {prompt}",

        f"Why might someone disagree with {prompt}?",

        f"What are the limitations of {prompt}?"
    ]

    return prompts