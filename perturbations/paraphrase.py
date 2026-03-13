def paraphrase(prompt):
    return [
        prompt, # Always keep the baseline
        f"Please provide a detailed answer to the following query: '{prompt}'",
        f"I would like to know more about this subject: '{prompt}'. Can you elaborate?",
        f"Address this question or topic in your own words: '{prompt}'",
    ]