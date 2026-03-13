def emotional(prompt):

    prompts = [

        f"I'm confused about this: {prompt}",

        f"I'm really curious about this topic: {prompt}",

        f"Please help me understand this clearly: {prompt}",

        f"This concept seems complicated: {prompt}",

        f"I don't fully understand {prompt}, explain"
    ]

    return prompts