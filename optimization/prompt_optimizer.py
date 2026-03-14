class PromptOptimizer:

    def __init__(self, llm):

        self.llm = llm

    def optimize(self, original_prompt, strategies):

        strategy_text = "\n".join(
            f"  {i+1}. {s}" for i, s in enumerate(strategies)
        )

        meta_prompt = f"""You are a prompt engineering expert. Your job is to rewrite a user prompt to make it more robust and reliable for language models.

Original prompt:
"{original_prompt}"

Apply these specific improvements:
{strategy_text}

Rules:
- Return ONLY the improved prompt, nothing else
- Do not add explanations or notes
- Keep the core intent of the original prompt
- Make the prompt clear, specific, and unambiguous

Improved prompt:"""

        candidates = self.llm.generate(meta_prompt, n=3, use_qa_template=False)

        cleaned = []

        for c in candidates:

            # extract only the text after "Improved prompt:"
            if "Improved prompt:" in c:
                c = c.split("Improved prompt:")[-1]

            c = c.strip().strip('"').strip("'").strip()

            # skip if empty or too similar to meta-prompt
            if len(c) > 10 and len(c) < 500:
                cleaned.append(c)

        return cleaned if cleaned else [original_prompt]
