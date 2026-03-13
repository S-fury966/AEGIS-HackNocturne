class TokenOptimizer:

    def __init__(self, llm):

        self.llm = llm

    def optimize(self, original_prompt):

        token_count = self.llm.count_tokens(original_prompt)

        meta_prompt = f"""You are a prompt compression expert. Your job is to rewrite a user prompt to be as SHORT and TOKEN-EFFICIENT as possible while preserving the EXACT same meaning and intent.

Original prompt ({token_count} tokens):
"{original_prompt}"

Rules:
- Return ONLY the compressed prompt, nothing else
- Do not add explanations, notes, or labels
- Preserve the EXACT core intent — the LLM must produce the same answer
- Remove all filler words, redundant qualifiers, and unnecessary detail
- Use the most concise phrasing possible
- Do NOT sacrifice clarity for brevity — the meaning must be unambiguous

Compressed prompt:"""

        candidates = self.llm.generate(meta_prompt, n=5)

        cleaned = []

        for c in candidates:

            if "Compressed prompt:" in c:
                c = c.split("Compressed prompt:")[-1]

            c = c.strip().strip('"').strip("'").strip()

            # skip empty, too long, or suspiciously short results
            if 3 < len(c) < len(original_prompt) * 2:
                cleaned.append(c)

        # deduplicate while preserving order
        seen = set()
        unique = []

        for c in cleaned:
            if c not in seen:
                seen.add(c)
                unique.append(c)

        return unique if unique else [original_prompt]
