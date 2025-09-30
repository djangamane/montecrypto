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

## Questions for Follow-up Research
1. Does `sonar-deep-research` fully support `response_format` JSON schemas, or is that exclusive to other models (`sonar-pro`, `pplx-7b-online`, etc.)?
2. Is there a separate Deep Research endpoint (async job) that guarantees structured output? The rate limit table references `/deep-research`, but their quickstart uses `/chat/completions`.
3. Are there request headers or SDK-specific flags needed when using deep research models? The Perplexity docs might require `X-Mode: research` or similar.
4. Does the API strip `<think>` only when the client specifies a particular `Accept` header or uses the beta SDK? We’re currently making raw `fetch` calls.
5. Are there examples from Perplexity’s docs demonstrating how to trigger structured outputs with the deep research model? What constraints or limitations do they note?

## Next Steps Before Coding Again
- Confirm the documentation for `sonar-deep-research` regarding supported response formats. The usage page (https://docs.perplexity.ai/getting-started/overview) and API reference should clarify whether the schema is honored.
- Investigate the `/deep-research` REST endpoint: request body, async polling, and response shape. Determine if it is the recommended path for structured outputs.
- Verify if Perplexity’s SDK (Node/Python) uses a different base URL or additional parameters to request structured responses.

This file consolidates the current state so the next investigation pass (e.g., via ChatGPT-5) can focus on the right portion of Perplexity’s docs, rather than rehashing the implementation history.
