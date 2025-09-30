# Perplexity Deep Research Integration — Persistent Formatting Issue

## Background
- API endpoint: `POST https://api.perplexity.ai/chat/completions`
- Model: `sonar-deep-research`
- Objective: complement the Gemini-generated newsletter briefing with a "Coin Watch" section driven by Perplexity’s deep research output.
- Request payload (current):
  - `stream: false`
  - `frequency_penalty: 1`
  - `temperature: 0.1`
  - `response_format` set to a JSON schema requiring `summary`, `findings`, and `sources`.
  - Prompt instructs Perplexity to return strictly valid JSON describing scam tokens during the last 10 days.

## Expected Behaviour
Perplexity should honor the JSON schema (per the docs) and provide a structured response in `choices[0].message`. Ideally, the SDK exposes `output_json` when the schema is satisfied. We intend to parse that structure and feed the data into the Coin Watch summary cards.

## Observed Behaviour
- Even with the JSON schema request, `choices[0].message` is still a plain-text string that begins with a `<think>…</think>` section followed by markdown prose and an embedded JSON block.
- The CLI logs confirm `choices length 1` but `parsed keys []`, meaning the `robustStripThinkAndParse` function cannot extract a valid object.
- The UI consequently displays the raw text and truncated JSON instead of clean bullet points.

## Current Logging Snapshot (Sep 29, ~21:24 UTC)
```
[perplexity] choices length 1
[perplexity] parsed keys []
```
No `output_json` is returned. When we print the raw message (truncated), the `<think>` trace is still present. This implies the server is ignoring the schema request and returning standard streaming reasoning text.

## Attempts & Investigations
1. **Prompt Reinforcement** – Prompt explicitly states "Return ONLY valid JSON" and lists the schema. No change.
2. **Response Format** – We added the `response_format` block mirroring the Perplexity documentation example. Still returning markdown + `<think>`.
3. **Fallback Parsers** – Implemented heuristics to strip `<think>`, search for the first `{}` block, and convert markdown bullet lists to structured data. Temporary fix, but not robust or future-proof.
4. **Logging** – Added Vercel runtime logs to inspect `payload.choices` and raw content. Logs show only the plain string response.
5. **UI Separation** – Moved the coin results into a dedicated `CoinWatchSummary` React component so insight cards remain unaffected.

## Confirmed Findings from Perplexity Docs & Community Notes
Recent documentation and community posts (see references) clarify:

1. **JSON schema is best-effort for Perplexity models.** `response_format` is parsed, but `sonar`/`sonar-deep-research` frequently emit the `<think>` reasoning trace and markdown before or after the JSON payload. Only select OpenAI GPT-4o family models enforce strict schema output.
2. **`sonar-deep-research` does not expose `output_json`.** Even with the schema request, the API returns `choices[0].message.content` as plain text. No SDK flag or header suppresses `<think>`; clients are expected to strip it.
3. **No `/deep-research` REST endpoint.** The rate-limit table references a model capability, but the public API is the same `/chat/completions` route. There is no documented async job that returns a guaranteed-structured report.
4. **Client-side parsing is required.** Perplexity’s own guides recommend removing the reasoning block and extracting the JSON/markdown manually. This matches what we are doing now.

Refer to the sources in docs/perplexity-investigation.md for details (Perplexity docs, community threads, promptfoo article, etc.).

## Next Steps Before Coding Again
- Since strict JSON enforcement is not supported, keep our robust fallback (strip `<think>`, parse embedded JSON, or convert markdown to findings).
- Monitor Perplexity’s changelog for future support. If they introduce a true structured-output mode, we can simplify the parser.
- For stronger guarantees today, consider an alternative provider (e.g., OpenAI GPT-4o with JSON schema) if compliance is critical.

This file consolidates the current state so the next investigation pass (e.g., via ChatGPT-5) can focus on the right portion of Perplexity’s docs, rather than rehashing the implementation history.
