---
layout: post
title: "LLM Tokenizers: The Hidden Engine Behind AI Language Models"
date: 2025-03-08 12:00:00 +0000
categories: [ai, ml]
tags: [llm, tokenization, nlp, ai, machine-learning, transformers]
description: "Tokenizers are the invisible foundation of every large language model, shaping context limits, API costs, cross-lingual fairness, and model reasoning. Here's how they work and why they matter."
image: "/assets/images/blog/llm-tokenizers.webp"
---

![LLM Tokenizers](/assets/images/blog/llm-tokenizers.webp)

A language model never sees your text. Before any neural network runs, the text is converted into numbers by a tokenizer. It's easy to ignore, but it explains a lot about how LLMs behave and what they cost.

## What tokenization is

The tokenizer splits text into pieces called tokens and maps each one to an ID from a fixed vocabulary. "Hello, world!" might become `[15496, 11, 995, 0]`. Those four numbers are all the model gets.

## Why you should care

- **Context windows are measured in tokens**, not words or characters.
- **API pricing is per token**, so how efficiently your text tokenizes affects the bill.
- **Some languages are penalised.** Text in languages that tokenize poorly uses up more of the context window and costs more.
- **Code, maths and prose all tokenize differently**, which affects how much of each you can fit.

## Three approaches

### Word-based

Split on spaces and punctuation. It's intuitive and simple, but the vocabulary gets enormous, and any word the tokenizer hasn't seen is a problem. Languages with lots of compound words, such as German, Finnish and Turkish, suffer the most.

### Character-based

Every character is a token, so "Hello world" becomes 11 tokens. The vocabulary is tiny and nothing is ever unknown. But sequences get five to ten times longer than with words, and the model has to work out meaning from individual letters, which is expensive.

### Subword

This is what modern models use, including GPT, Claude, Llama and Gemini. Words are broken into meaningful chunks: "Unlikeliest" might become `["Un", "likely", "est"]`.

The most common algorithm is Byte-Pair Encoding (BPE):

1. Start with single characters.
2. Count how often each adjacent pair occurs.
3. Merge the most frequent pair into a new token.
4. Repeat until you reach the target vocabulary size, typically 10,000 to 100,000.

Common words end up as single tokens, rare words get split into pieces you can recognise, and the vocabulary stays manageable.

## How it affects models

**Cost.** Training, fine-tuning and inference all scale with token counts. The same prompt can tokenize differently from one model to another, so the price for identical content varies.

**Fairness across languages.** This is the part that bothers me most. A tokenizer trained mostly on English handles English very efficiently. Thai, Arabic and many African languages often need far more tokens for the same content. That means higher cost, less room in the context window, and often worse quality because there was less data for them.

**Reasoning.** When one idea gets spread over many tokens, the model has to connect them through attention. Token boundaries that don't line up with the meaning can also cause odd behaviour. This is part of why models are famously bad at things like counting letters in a word.

## Practical tips

- Look at your text in a tokenizer tool, such as OpenAI's tokenizer playground, to see where the boundaries fall.
- Expect prompts in different languages to cost different amounts.
- Structured formats like JSON and markdown tend to tokenize reasonably well, but check rather than assume.
- Remember that code tokenizes very differently from prose when you estimate size.

## Where it's heading

People are working on character-level fallbacks for rare words, tokenizers learned during pre-training, and models that work directly on bytes and skip tokenization altogether. I'd keep an eye on the byte-level work in particular.

## Wrapping up

Tokenizers sit between human language and the model, and they shape cost, context limits and fairness across languages. You don't need to understand BPE to use an LLM, but knowing it's there makes a lot of strange behaviour make sense, and it helps you estimate costs more accurately.
