def logical_flip(prompt):
    return [
        f"What are the most common misconceptions or incorrect assumptions people make regarding: '{prompt}'?",
        f"If someone held the complete opposite or contrarian view on this, what would they argue? Query: '{prompt}'",
        f"Play devil's advocate and critique the standard answer to this question: '{prompt}'"
    ]