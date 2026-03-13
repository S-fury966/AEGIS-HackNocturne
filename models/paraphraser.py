def simple_paraphrase(prompt):

    variations = [
        prompt,
        "Explain " + prompt,
        "Describe " + prompt,
        "Can you explain " + prompt + "?"
    ]

    return variations