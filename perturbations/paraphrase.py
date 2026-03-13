def paraphrase(prompt):

    prompts = [

        prompt,

        f"Explain the concept of {prompt}",

        f"Describe how {prompt} works",

        f"What does {prompt} mean?",

        f"Give a clear explanation of {prompt}",

        f"Summarize the idea behind {prompt}"
    ]

    return prompts