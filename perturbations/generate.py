from perturbations.paraphrase import paraphrase
from perturbations.emotional import emotional
from perturbations.structural import structural
from perturbations.logical_flip import logical_flip
from perturbations.reasoning import reasoning

# fixed type order; paraphrase first so the original prompt (paraphrase[0]) is always selected first
PERTURBATION_TYPES = [
    ("paraphrase", paraphrase),
    ("emotional", emotional),
    ("structural", structural),
    ("logical_flip", logical_flip),
    ("reasoning", reasoning),
]


def generate_perturbations(prompt, limit=12):
    """Return up to `limit` (prompt_text, type_name) tuples, deterministically.

    Duplicates across the whole result are dropped (first occurrence wins), then items
    are picked round-robin across types so every type is represented.
    """

    seen = set()  # membership only; ordering always comes from the lists
    per_type = []

    for type_name, fn in PERTURBATION_TYPES:
        unique = []
        for text in fn(prompt):
            if text not in seen:
                seen.add(text)
                unique.append(text)
        per_type.append((type_name, unique))

    selected = []
    index = 0

    while len(selected) < limit:
        added = False
        for type_name, items in per_type:
            if index < len(items):
                selected.append((items[index], type_name))
                added = True
                if len(selected) == limit:
                    break
        if not added:
            break
        index += 1

    return selected
