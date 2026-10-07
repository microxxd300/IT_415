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

**Commit SHA:** 580c1c9

### AI-M1-03 — Generation — Cheny — 2026-10-07
**Step / branch:** Step 2, Part 2 — feature/frontend-setup

**Prompt:** "Part 2: OrderContext.jsx exactly per section 6 (useReducer), Header, StepIndicator, Toast, base.css (kiosk look, touch sizes), App.jsx that loads products (loading + error states) and switches between all 8 screens, with placeholder files for every screen so the full flow is clickable." Follow-up typed: "go". The team's coffee-POS screenshot was used as the visual reference.

**AI response summary:** The AI created src/state/OrderContext.jsx: one useReducer store (screen, category, products, cart, transaction) with addItem, increase, decrease (from 1 removes the line), remove, setCategory, goTo, setTransaction, newTransaction (clears everything except products and shows "New transaction started — previous order cleared"), plus cartTotal and itemCount; a ToastProvider with useToast() → showToast(message, type). It added one extra action, setProducts, so App can store the loaded products. Header ("Campus Store · Self-service kiosk"), StepIndicator (1 Order · 2 Review · 3 Payment · 4 Receipt, finished steps get a ✓), Toast (always-present live region, message disappears after 2.5 s), base.css (light grey background, white rounded cards, dark and amber buttons, 18px base font, buttons at least 56px tall, no hover-only actions), App.jsx (loading text, error message with "Try again", screen switch without a router) and 8 placeholder screens with Back/Continue buttons. It also added an empty favicon link in index.html to stop a 404 in the console.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 5 passed; `npm run build` → OK. Browser (Chrome, 1280×800, backend running): Item Selection shows "6 products loaded"; Proceed → Order Summary (step 1 ✓) → Continue → Payment Method (3 buttons) → QR Payment → Confirm → Payment Successful → View Receipt → Receipt → New Transaction → back to Item Selection with the toast "New transaction started — previous order cleared". Console: only a favicon 404, fixed with the favicon link.

**Commit SHA:** fill in after committing
