# AI Development Log — M1 Cheny Dalugdog

### AI-M1-01 — Review — Cheny — 2026-10-07
**Step / branch:** Review of PR #1 feature/backend-products (Step 1, author M3 Lumpayao)

**Prompt:** "review feature/backend-products as Cheny"

**AI response summary:** The AI compared origin/main...origin/feature/backend-products (12 files) against the API contract, file ownership, centavo math, validation and error handling. It reported 5 items: (1) HIGH — sqlite3 connections fail when a request runs on more than one thread; proved by sending 400 concurrent requests to a test server (380 returned 500 with "SQLite objects created in a thread can only be used in that same thread"); fix: check_same_thread=False. (2) MEDIUM — 500 responses have no CORS header, so the browser would show "Cannot reach the server" instead of the detail message. (3) LOW — unpinned requirements. (4) LOW — misleading transaction comment around executescript. (5) Suggestion — friendlier validation messages for Step 4. Verdict: request changes. After the review, the author removed SQLite, so items 1 and 4 no longer apply.

**Evaluation:** (Drafted with AI help at Cheny's request.) Correct: the thread bug was real — the AI proved it with 400 concurrent requests instead of guessing — and the missing CORS header on 500 errors was confirmed with a test route. Useful: issues were ranked by severity with file, line and fix. Limitation: the AI could not post the review itself; the reviewer has to read the diff and post on GitHub. Items 1 and 4 became irrelevant once the team dropped SQLite.

**Changes we made:** Posted items 2 (CORS on 500 errors) and 3 (pin versions) as one "Request changes" review on PR #1, using the AI's suggested wording. Did not post items 1 and 4 (SQLite removed) or item 5 (suggestion for Step 4).

**Verification:** Posted "Request changes" on PR #1 with items 2 and 3; after fixes e6e2f66 (CORS on 500) and 5cf0711 (pinned versions), approved PR #1 ("Both fixes look good, tests pass. Approved."). PR #1 merged as 9f2e686.

**Commit SHA:** fill in after committing

### AI-M1-02 — Generation — Cheny — 2026-10-07
**Step / branch:** Step 2, Part 1 — feature/frontend-setup

**Prompt:** "Part 1: scaffold Vite + React (JavaScript) in frontend/ (if create-vite asks interactive questions, create the files manually), add Vitest with an "npm test" script, src/api/client.js, src/utils/money.js + money.test.js." Follow-up typed: "ready", then "go".

**AI response summary:** The AI created the Vite + React 18 project by hand (package.json with dev/build/test scripts, vite.config.js with port 5173 fixed so it matches the backend CORS rule, index.html, src/main.jsx, a placeholder src/App.jsx). src/api/client.js has getProducts(), createTransaction(payload) and getTransaction(reference); any non-2xx response throws ApiError with the server's "detail" message and status, and a network failure throws ApiError("Cannot reach the server. Please ask staff for help.", 0). src/utils/money.js has formatPeso(centavos), which formats integer centavos as "₱1,234.56" without float math on the peso value. money.test.js has 5 tests.

**Evaluation:** (Drafted with AI help at Cheny's request.) Correct: the files were created by hand, so there were no interactive create-vite questions; formatPeso works on integer centavos, so totals cannot drift by a centavo; port 5173 is fixed to match the backend CORS rule. Limitations: client.js has no automated tests yet (it is checked through the screens later); App.jsx is only a placeholder until Part 2.

**Changes we made:** None — accepted as generated.

**Verification:** Manual: `npm run dev` → http://localhost:5173 shows "Campus Store · Self-service kiosk — Setup in progress." `npm install` → 41 packages, 0 vulnerabilities. `npm test` → 5 passed (₱0.00, ₱45.00 / ₱175.00, ₱0.05 / ₱1,234.56, ₱1,000,000.00, -₱25.00). `npm run build` → built successfully. node_modules and dist are git-ignored.

**Commit SHA:** fill in after committing
