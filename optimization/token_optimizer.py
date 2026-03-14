import re


class TokenOptimizer:

    def __init__(self, llm):

        self.llm = llm

    def optimize(self, original_prompt):

        token_count = self.llm.count_tokens(original_prompt)
        heuristic_candidates = self._heuristic_compressions(original_prompt, token_count)

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

        candidates = self.llm.generate(meta_prompt, n=5, use_qa_template=False)

        cleaned = list(heuristic_candidates)

        for c in candidates:

            if "Compressed prompt:" in c:
                c = c.split("Compressed prompt:")[-1]

            c = c.strip().strip('"').strip("'").strip()

            candidate_tokens = self.llm.count_tokens(c)

            # keep only plausible prompt rewrites that are actually shorter
            if 3 < len(c) < len(original_prompt) * 2 and 0 < candidate_tokens < token_count:
                cleaned.append(c)

        # deduplicate while preserving order
        seen = set()
        unique = []

        for c in cleaned:
            if c not in seen:
                seen.add(c)
                unique.append(c)

        return unique if unique else [original_prompt]

    def _heuristic_compressions(self, original_prompt, token_count):

        prompt = re.sub(r"\s+", " ", original_prompt.strip())
        variants = []

        def add(candidate):

            candidate = candidate.strip()

            if not candidate or candidate == prompt:
                return

            candidate_tokens = self.llm.count_tokens(candidate)

            if 0 < candidate_tokens < token_count:
                variants.append(candidate)

        def compact_phrase(text):

            text = text.strip().rstrip("?!.:,;")
            text = re.sub(r"\b(a|an|the)\b", "", text, flags=re.IGNORECASE)
            text = re.sub(r"\s+", " ", text).strip()

            return text

        patterns = [
            (
                r"^how many (?P<object>.+?) does (?P<subject>.+?) have\??$",
                lambda m: f"{compact_phrase(m.group('subject'))} {compact_phrase(m.group('object'))}?"
            ),
            (
                r"^how many (?P<object>.+?) are in (?P<subject>.+?)\??$",
                lambda m: f"{compact_phrase(m.group('object'))} in {compact_phrase(m.group('subject'))}?"
            ),
            (
                r"^who made (?P<object>.+?)\??$",
                lambda m: f"{compact_phrase(m.group('object'))} inventor?"
            ),
            (
                r"^what is the (?P<object>.+?) of (?P<subject>.+?)\??$",
                lambda m: f"{compact_phrase(m.group('object'))} of {compact_phrase(m.group('subject'))}?"
            ),
            (
                r"^where is (?P<object>.+?)\??$",
                lambda m: f"{compact_phrase(m.group('object'))} location?"
            ),
            (
                r"^when did (?P<subject>.+?) (?P<verb>.+?)\??$",
                lambda m: f"{compact_phrase(m.group('subject'))} {compact_phrase(m.group('verb'))} when?"
            )
        ]

        for pattern, builder in patterns:
            original_match = re.match(pattern, prompt, flags=re.IGNORECASE)

            if original_match:
                add(builder(original_match))

        add(compact_phrase(prompt.replace("How many", "").replace("how many", "")) + "?")
        add(compact_phrase(
            prompt
            .replace("How many", "")
            .replace("how many", "")
            .replace(" does ", " ")
            .replace(" do ", " ")
            .replace(" is ", " ")
            .replace(" are ", " ")
            .replace(" have", "")
        ) + "?")

        seen = set()
        unique = []

        for variant in variants:
            if variant not in seen:
                seen.add(variant)
                unique.append(variant)

        return unique
