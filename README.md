# Prefix Lab

A standalone, browser-only 3D learning site for **prompt caching economics**. This repository, build, progress store, and hosting are separate from the Field Lab physics site and the Token Economics course. No login, API key, provider request, or backend.

## Lessons

1. **Exact prefix:** click a 3D tools/system/history/user block (or an accessible button) to change the second request. The cache breakpoint sits after the stable history. Only changing the new user turn preserves a full 4,000-token read; changing an upstream block requires a write at that breakpoint. A first-call and second-call cost receipt changes with the selected scenario and model.
2. **Cache lifetime:** ten calls, 4,000-token prefix, 200 fresh input tokens and 300 output tokens per call. Change the time gap, choose Claude's 5-minute or 1-hour cache write, deliberately change the system at call six, and inspect each call's read/write receipt. Hits renew the TTL in this simplified model.
3. **Agent economics:** four comparable model cost towers split into fresh input, first write, repeated reads, and output. Vary agent turns, prefix size, base output, illustrative effort, model, and cache reuse. The exercise isolates cached-read spending; it does **not** assert that a cheaper model passes your quality evaluation.

The example short-context USD rates per million tokens are intentionally fixed to the supplied curriculum: Opus 5.5 (fresh 4 / 5-minute write 5 / read 0.20 / output 20; one-hour write 8), Sol (2 / 2.50 / 0.20 / 10), Astra (10 / 12.50 / 1 / 50), and Fable 5.1 (10 / 12.50 / 0.25 / 50; one-hour write 20). These are **lesson assumptions**, not a fetched price quote or an invoice. The agent effort choices multiply assumed output by 0.6, 1, or 1.6 solely to demonstrate output sensitivity; they are not empirical provider measurements. All costs use `(fresh × Pin + write × Pw + read × Pr + output × Pout) / 1,000,000`.

Sources to check before real budgeting: [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [OpenAI pricing](https://developers.openai.com/api/docs/pricing). The [Ryan Sael example post](https://x.com/RyanSael/status/2104371800243405161) shows lesson examples and promises an open-source method; the actual recipe/repository was not available to this build. This code and artwork are original, borrowing the interactive-teaching pattern rather than creator assets.

## Local development

```bash
pnpm install
pnpm dev --port 4189
pnpm test
pnpm build
node tests/browser.mjs   # with dev server running and Chromium installed
```

The Chromium smoke test uses `/run/current-system/sw/bin/chromium`; adjust that local executable path on other systems. Static production output is `dist/`. GitHub Pages publishing is defined in `.github/workflows/deploy.yml` and runs on pushes to `main`.

Progress is only the three challenge-completion flags in this browser's `localStorage` (`prefix-lab-progress-v1`). The results are simulated; no prompts, traces, or API usage are collected or sent. WebGL is used for the scene; calculation controls and explanations remain available if rendering is unsupported.
