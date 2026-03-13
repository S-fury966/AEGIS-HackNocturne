def reasoning(prompt):
    return [
        f"Don't just give me the final answer, walk me through your step-by-step thinking process for: '{prompt}'",
        f"What is the historical or deeper context I need to understand before asking about: '{prompt}'?",
        f"Explain the fundamental 'why' and the underlying mechanisms behind this query: '{prompt}'"
    ]