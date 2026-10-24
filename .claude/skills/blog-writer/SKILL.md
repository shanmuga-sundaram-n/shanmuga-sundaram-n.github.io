---
name: blog-writer
description: Write a new blog post for shanmugasundaram.in (Jekyll). Use when the user says "write a blog", "new post", "draft a post about X", or gives a topic/notes/link to turn into an article. Handles research, outline approval, drafting in Shan's voice, Jekyll front matter, Mermaid diagrams, independent review, and a build check.
argument-hint: "<topic or notes or URL> [--length short|standard|deep] [--type how-to|opinion|case-study|comparison|deep-dive]"
---

# Blog Writer

Produces a publish-ready Jekyll post in `_posts/` for Shan's portfolio blog. Follow the phases in order. Do not skip the outline approval or the review.

## Phase 0: Intake
Read `$ARGUMENTS`. Establish, asking only for what is missing (one `AskUserQuestion` call at most):
- **Topic and angle**: the single claim or lesson the post exists to make.
- **Reader**: default is senior engineers / architects / tech leads.
- **Type** (see `references/templates.md`) and **length**: short ~1000, standard ~1800-2500, deep ~3500-4500 words.
- **First-hand material**: numbers, code, incidents, or decisions Shan actually has. Posts must contain real experience. Never invent benchmarks, anecdotes, quotes, or "I profiled X and found Y" claims. If there is no first-hand material, write the post as analysis and say so, or ask.

Skim 2-3 recent files in `_posts/` plus `references/voice.md` so the draft matches house style.

## Phase 1: Research
- Verify every external fact, version, release date, price, and statistic with WebSearch/WebFetch. Keep a list of source URLs.
- Anything you cannot verify gets cut or flagged `[VERIFY]` for the user. Never leave a `[VERIFY]` in the final file without telling the user.
- Check `_posts/` for overlap with existing posts; link to related ones with `{% raw %}{{ site.baseurl }}{% endraw %}` style or `{% raw %}{% post_url YYYY-MM-DD-slug %}{% endraw %}`.

## Phase 2: Outline (approval gate)
Present: working title, 1-sentence thesis, description (<=160 chars), H2 list with a one-line purpose each, planned diagrams/code samples, and sources. **Stop and wait for user approval or edits** before drafting.

## Phase 3: Draft
Create `_posts/YYYY-MM-DD-kebab-slug.md` using today's date (check the environment date) and this front matter:

```yaml
---
layout: post
title: "..."
date: YYYY-MM-DD 09:00:00 +0000
categories: [ai, architecture]      # 1-3, lowercase, reuse existing ones
tags: [kebab-case, ...]             # 5-10, reuse existing tags where possible
description: "..."                  # 140-160 chars, states the payoff, no clickbait
---
```

Rules:
- No H1 in the body (layout renders the title). Use `##` and `###` only, in order.
- Open with the concrete problem or tension in the first two sentences. No "In today's fast-paced world".
- Lead each H2 with its conclusion. Keep paragraphs to 2-4 sentences.
- Code blocks always have a language tag. Keep samples runnable and minimal.
- Diagrams use fenced `mermaid` blocks (existing posts do; confirm the layout supports it with `grep -ri mermaid _layouts assets`). Add one only when it shows a mechanism prose can't.
- Link sources inline at the claim. Internal links via `post_url`.
- End with a decision rule, takeaway, or next step. No "In conclusion".
- Liquid gotcha: any literal `{% raw %}{{ }}{% endraw %}` or `{% raw %}{% %}{% endraw %}` in code samples must be wrapped in `{% raw %}{% raw %}...{% endraw %}{% endraw %}`.
- Images go in `assets/images/blog/<slug>/` with alt text; reference with `{% raw %}{{ '/assets/images/...' | relative_url }}{% endraw %}`.

## Phase 4: Review (independent)
Launch the `blog-reviewer` sub-agent on the new file (Agent tool, `subagent_type: "blog-reviewer"`). Give it the file path, thesis, and source list. It returns a scored report with P0/P1/P2 issues.
- Fix every P0 and P1, then re-run the reviewer. Maximum 3 iterations.
- Target score >= 85 with zero P0. If still failing after 3 rounds, report the remaining issues to the user instead of looping.

## Phase 5: Build check
Run `bundle exec jekyll build` (per CLAUDE.md, `jekyll serve` may not work on Apple Silicon; if build fails for environment reasons, say so rather than guessing). Confirm the post renders in `_site/` and Mermaid/code blocks survived.

## Phase 6: Hand-off
Report: file path, title, word count, reviewer score, sources used, any claims the user must confirm from first-hand knowledge. **Do not commit or push** unless the user asks. Offer follow-ups: LinkedIn/Medium repurpose, social teaser, related-post links.

## Boundaries
- Don't modify layouts, CSS, or other posts as part of writing a post, except adding a back-link the user agrees to.
- Don't fabricate. A shorter honest post beats a longer invented one.
