def structural(prompt):
    return [
        f"Answer this query in exactly three concise bullet points: '{prompt}'",
        f"Provide a one-sentence, TL;DR summary addressing this: '{prompt}'",
        f"Explain the answer to this as if I were a 5-year-old child: '{prompt}'",
        f"Structure your response to this as a logical, step-by-step breakdown: '{prompt}'"
    ]