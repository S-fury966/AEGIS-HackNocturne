#  AEGIS

### **LLM Robustness, Stability & Prompt Fragility Analysis System**

------------------------------------------------------------------------

#  Abstract

Large Language Models (LLMs) exhibit strong surface-level intelligence
but often suffer from **hidden instability**.\
Minor perturbations in prompt phrasing, structure, or intent can lead to
**significant variance in outputs**.

**AEGIS** is a systematic framework designed to:

-   Quantify **prompt sensitivity**
-   Detect **reasoning collapse**
-   Measure **semantic consistency**
-   Identify **failure modes under perturbations**

------------------------------------------------------------------------

#  Core Problem

LLMs are **non-deterministic reasoning systems**.

Even trivial prompt changes can cause:

  Change Type    Example
  -------------- ----------------------------------------
  Paraphrase     "Explain gravity" → "Describe gravity"
  Structural     Bullet vs paragraph
  Logical Flip   "Why is X true?" vs "Why is X false?"
  Emotional      "I'm confused about X"

These changes often produce **different answers**, even when meaning is
unchanged.

------------------------------------------------------------------------

#  Key Insight

> LLMs are not just answering questions ---\
> they are **reacting to prompt distributions**.

AEGIS measures how fragile that reaction is.

------------------------------------------------------------------------

#  System Architecture

    Frontend (Vercel)
            ↓
    FastAPI Backend (HF Spaces)
            ↓
    Prompt Perturbation Engine
            ↓
    LLM Inference Layer
            ↓
    Embedding Model (Sentence Transformers)
            ↓
    Analysis Engine
            ↓
    Visualization + Metrics Output

------------------------------------------------------------------------

#  End-to-End Pipeline

### 1. Prompt Input

User provides base prompt.

### 2. Perturbation Generation

Prompt is expanded into multiple variants:

-   Paraphrase
-   Structural transformation
-   Logical inversion
-   Emotional framing
-   Reasoning prompts

------------------------------------------------------------------------

### 3. LLM Inference

Each prompt variant is passed through the model.

------------------------------------------------------------------------

### 4. Embedding Encoding

All outputs are encoded into vector space.

------------------------------------------------------------------------

### 5. Similarity Computation

Cosine Similarity:

    similarity(A, B) = (A · B) / (||A|| ||B||)

------------------------------------------------------------------------

### 6. Stability Metrics

####  Similarity Score

Measures consistency across outputs.

####  Graph Stability Score

Measures structural coherence between responses.

####  Hallucination Risk

Estimated via divergence across outputs.

####  Confidence Score

Weighted composite of all metrics.

------------------------------------------------------------------------

### 7. Final Stability Score

    Final Score = weighted(similarity, stability, hallucination)

------------------------------------------------------------------------

#  Prompt Fragility Mapping

AEGIS classifies fragility across:

  Category       Meaning
  -------------- ------------------------
  Structural     Formatting sensitivity
  Paraphrase     Rewording sensitivity
  Emotional      Tone sensitivity
  Reasoning      Step-based prompts
  Logical Flip   Contradictory framing

------------------------------------------------------------------------

#  Visualization Modules

AEGIS generates:

-    Similarity Heatmaps\
-    Stability Graphs\
-    Sensitivity Curves\
-    Stability Landscape

------------------------------------------------------------------------

#  Prompt Cost Optimization (Experimental)

AEGIS introduces a **hybrid optimization system**:

### Stage 1 --- Cheap Model Filtering

-   Run candidates on lightweight model\
-   Remove unstable prompts

### Stage 2 --- Expensive Model Evaluation

-   Evaluate shortlisted prompts\
-   Optimize for:
    -   correctness\
    -   token efficiency\
    -   stability

------------------------------------------------------------------------

## Objective Function

    score = α * accuracy - β * token_cost + γ * stability

------------------------------------------------------------------------

#  Project Structure

    AEGIS/
    ├── analysis/              # Metrics & scoring
    ├── models/                # LLM interface
    ├── perturbations/         # Prompt generation
    ├── optimization/          # Cost optimizer
    ├── visualization/         # Graphs & plots
    ├── api.py                 # FastAPI entrypoint
    ├── service.py             # Core pipeline
    ├── main.py                # CLI runner
    ├── requirements.txt
    ├── Dockerfile
    └── README.md

------------------------------------------------------------------------

#  Deployment Architecture

  Component   Platform
  ----------- --------------------------
  Backend     Hugging Face Spaces
  Frontend    Vercel
  Models      HuggingFace Transformers

------------------------------------------------------------------------

#  Performance Analysis

  Environment             Latency
  ----------------------- -------------
  Local GPU               3--8 sec
  HF CPU                  30--120 sec
  Optimization Pipeline   2--6 mins

------------------------------------------------------------------------

#  Limitations

-   CPU-bound inference bottleneck\
-   Heuristic scoring system\
-   No batching (yet)\
-   Model-dependent behavior

------------------------------------------------------------------------

#  Future Work

-   GPU acceleration (Spaces upgrade)\
-   Batched inference\
-   Learned scoring model\
-   Prompt embedding clustering\
-   Cross-model benchmarking\
-   SaaS deployment

------------------------------------------------------------------------

#  Research Extensions

AEGIS opens directions in:

-   LLM calibration\
-   uncertainty estimation\
-   adversarial prompting\
-   robustness benchmarking

------------------------------------------------------------------------

#  Author

**Sayan Soumya**\
GitHub: https://github.com/S-fury966

**Rehan Imtiyaj Mulla**\
GitHub: https://github.com/Rehxn2k06

------------------------------------------------------------------------

#  Final Note

AEGIS is not just a tool.

It is a **lens to understand how LLMs actually behave** ---\
beyond surface-level correctness.
