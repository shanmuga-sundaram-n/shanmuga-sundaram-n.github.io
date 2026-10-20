---
layout: post
title: "Stop Using a Language Model for Everything. Here's What I Use Instead."
date: 2026-10-20 09:00:00 +0000
categories: [ai, architecture, engineering]
tags: [jev-ai, system-one-model, llm, enterprise-architecture, agent-pipeline, typesafe-ai, rlcd, rlhf, rag, agentic-ai]
description: "Most enterprise agent pipelines route every AI call through an LLM. After profiling a production pipeline, I found 80% of those calls were structured decision work that didn't need generative capability at all. Here's what I use instead, and when."
---

Most enterprise agent pipelines have the same assumption baked in from the start: the AI layer is an LLM, every call goes through it, and the question is just which one. I built a production pipeline with that assumption and ran it long enough to start questioning it.

When I profiled the call breakdown, roughly 80% of the AI work was structured decision-making. Classify this intent. Score this document for relevance. Extract these fields from an unstructured input. None of those outputs were ever read by a human. They fed directly into the next system. I was paying frontier LLM prices and tolerating LLM latency for tasks that didn't need generative capability at all. And occasionally the model would invent a field that wasn't in the input, because nothing in its architecture prevents that.

That's what prompted me to evaluate Jev, released in September 2026 by TypeSafe AI, founded by Diogo Almeida (formerly OpenAI).

## What System One Models Actually Are

LLMs are trained with RLHF. The optimization target is outputs human raters prefer, which makes them excellent at generation and structurally overconfident. Uncertain answers score poorly with human raters even when uncertainty is the accurate state. The output is always a string. Your code parses it, validates it, and lives with the fact that there's always a path where the model produces well-formatted nonsense.

Jev uses RLCD, Reinforcement Learning for Calibrated Decisions. You define the output schema in advance. The model selects from that space and returns a typed value with a calibrated confidence score. There's no generative step. The model cannot produce an output that violates the schema because the schema is the entire output space. TypeSafe describes it as "a frontier-intelligence function call: unstructured state in, typed probabilistic decisions out."

The calibration is as important as the typing. An LLM prompted to express confidence tends to express consistent confidence, not accurate confidence. Calibrated means when Jev reports 90% confidence, it's right 90% of the time statistically across those calls. That becomes a real architectural control surface: you set the threshold for autonomous action versus escalation, and the threshold is meaningful.

## The Two-Stack Architecture

Most real agent pipelines have two kinds of work running through the same model class: decision-making at the edges and synthesis at the core. Separating them is what makes the cost and latency gap meaningful.

```mermaid
flowchart TD
    A([Incoming Query]) --> B["Jev: Intent Classification\n70–500ms · $0.042/MTok"]
    B --> C{Confidence\nScore}
    C -->|"> 0.85 · High confidence"| D[Route Directly\nStructured action]
    C -->|"< 0.85 · Low confidence"| E[Escalate to LLM\nClaude / GPT]
    E --> F[Synthesis + Generation\nOutput a human reads]
    D --> G([Pipeline continues])
    F --> G
```

The confidence threshold is the key architectural lever. With an LLM, "escalate if unsure" requires prompt engineering and hoping the model accurately signals its own uncertainty. With Jev, it's a numeric cutoff on calibrated output. You set it, it's testable, it's consistent.

## What This Looks Like in Code

Here's a routing step from a RAG intake pipeline. The before version uses an LLM to classify whether an incoming query needs retrieval:

```python
# Before: LLM call, parse string, hope it says yes or no
response = claude.messages.create(
    model="claude-sonnet-5-5",
    messages=[{"role": "user", "content": f"Does this query need retrieval? {query}"}]
)
needs_retrieval = "yes" in response.content[0].text.lower()
```

The failure mode here is invisible: the model parses and responds in ways that look right and aren't. It might say "Yes, retrieval is needed" or "Retrieval would be appropriate here" or add caveats that break the parse. The Jev version:

```python
# After: Jev typed decision with calibrated confidence
result = jev.decide(
    input=query,
    schema={
        "needs_retrieval": {"type": "bool"},
        "category": {"type": "enum", "values": ["billing", "technical", "general"]}
    }
)
if result.confidence > 0.85:
    route_autonomously(result.needs_retrieval, result.category)
else:
    escalate_to_llm(query)
```

The difference isn't just cleaner code. The schema fails loudly at definition time, not silently at runtime. And the confidence gate is a real signal, not a parsed string.

## The Cost and Latency Gap

Frontier LLMs run $0.20 to $10 per million input tokens with response times of 3 to 329 seconds. Jev is $0.042 per million tokens, responds in 70 to 500ms, and output tokens are free.

For classification, routing, and structured extraction workloads, that's roughly 100x cheaper and 40 to 200x faster. TypeSafe published results from Jack and Jill, a hiring platform: they replaced an LLM-based candidate screening pipeline with Jev and got 88% cost reduction, 2x throughput, and 10 days from test to production.

## The Decision Rule

If the AI call ends with a human reading the output, use an LLM. If it ends with your code acting on the output, evaluate Jev first.

The second category is larger than most architects realize. Routing, intent classification, entity extraction, confidence gating, relevance scoring. These are all structured decision tasks running at LLM prices inside most pipelines today, not because they need generative capability but because LLMs are the default reach.

The enterprise AI conversation has spent two years on which LLM vendor to use. For the decision-making workload inside a real agent pipeline, that's the wrong question. The question is which model class.
