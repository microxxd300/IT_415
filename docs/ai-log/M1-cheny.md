# AI Development Log — M1 Cheny Dalugdog

### AI-M1-01 — Review — Cheny — 2026-10-07
**Step / branch:** Review of PR #1 feature/backend-products (Step 1, author M3 Lumpayao)

**Prompt:** "review feature/backend-products as Cheny"

**AI response summary:** The AI compared origin/main...origin/feature/backend-products (12 files) against the API contract, file ownership, centavo math, validation and error handling. It reported 5 items: (1) HIGH — sqlite3 connections fail when a request runs on more than one thread; proved by sending 400 concurrent requests to a test server (380 returned 500 with "SQLite objects created in a thread can only be used in that same thread"); fix: check_same_thread=False. (2) MEDIUM — 500 responses have no CORS header, so the browser would show "Cannot reach the server" instead of the detail message. (3) LOW — unpinned requirements. (4) LOW — misleading transaction comment around executescript. (5) Suggestion — friendlier validation messages for Step 4. Verdict: request changes. After the review, the author removed SQLite, so items 1 and 4 no longer apply.

**Evaluation:** (Drafted with AI help at Cheny's request.) Correct: the thread bug was real — the AI proved it with 400 concurrent requests instead of guessing — and the missing CORS header on 500 errors was confirmed with a test route. Useful: issues were ranked by severity with file, line and fix. Limitation: the AI could not post the review itself; the reviewer has to read the diff and post on GitHub. Items 1 and 4 became irrelevant once the team dropped SQLite.

**Changes we made:** Posted items 2 (CORS on 500 errors) and 3 (pin versions) as one "Request changes" review on PR #1, using the AI's suggested wording. Did not post items 1 and 4 (SQLite removed) or item 5 (suggestion for Step 4).

**Verification:** Posted "Request changes" on PR #1 with items 2 and 3; after fixes e6e2f66 (CORS on 500) and 5cf0711 (pinned versions), approved PR #1 ("Both fixes look good, tests pass. Approved."). PR #1 merged as 9f2e686.

**Commit SHA:** 580c1c9

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

**Evaluation:** (Drafted with AI help at Cheny's request.) Correct: the store follows the section 6 contract, decreasing from 1 removes the line so quantities never go negative, and New Transaction keeps only the product list; the AI tested the full click-through in a real browser instead of only building. Deviation: it added setProducts, which is not in the contract, so App can save the loaded products — acceptable because nothing else changes. Limitations: the reducer's cart logic is not unit-tested yet (it moves to cart.js with tests in Step 3), and the "Try again" error state was not tested in the browser because the backend was running.

**Changes we made:** None — accepted as generated.

**Verification:** `npm test` → 5 passed; `npm run build` → OK. Browser (Chrome, 1280×800, backend running): Item Selection shows "6 products loaded"; Proceed → Order Summary (step 1 ✓) → Continue → Payment Method (3 buttons) → QR Payment → Confirm → Payment Successful → View Receipt → Receipt → New Transaction → back to Item Selection with the toast "New transaction started — previous order cleared". Console: only a favicon 404, fixed with the favicon link.

**Commit SHA:** d3c32ff

### AI-M1-04 — Debugging — Cheny — 2026-10-07
**Step / branch:** Step 2, fix review on PR #2 feature/frontend-setup (reviewer: Laiza)

**Prompt:** Laiza's review (Request changes): "client.js: add a timeout (AbortSignal.timeout(15000)) so a frozen server can't leave the kiosk stuck on Loading or Processing. App.jsx: add cleanup to the product-loading effect. StrictMode sends 2 requests, and a late failure can show the error screen. money.js: guard against non-numbers (NaN) and add a test. OrderContext: add the provider check to useCurrentToast."

**AI response summary:** One fix per comment:
1. client.js — every fetch now has `signal: AbortSignal.timeout(15000)`; a timeout falls into the existing catch and shows "Cannot reach the server. Please ask staff for help."
2. App.jsx — the product-loading effect passes an isCurrent() check and its cleanup marks the earlier load as stale, so only the latest request can change the screen; the Try again button now calls `loadProducts()` without passing the click event.
3. money.js — formatPeso returns "—" for anything that is not a finite number (undefined, null, "4500", NaN); new test added.
4. OrderContext.jsx — useCurrentToast throws a clear error when used outside ToastProvider, like useOrder and useToast.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 6 passed (new NaN test); `npm run build` → OK. Browser: simulated the server failing for the first 2 requests (both StrictMode loads) → "Cannot reach the server. Please ask staff for help." with Try again → clicked Try again → "6 products loaded". Limitation noted: if a payment request times out after the server already saved it, the kiosk shows an error although the payment went through (rare; to watch in Step 5).

**Commit SHA:** 6a2a135

### AI-M1-05 — Generation — Cheny — 2026-10-07
**Step / branch:** Step 3, Part 1 — feature/frontend-ordering

**Prompt:** "Part 1: src/utils/cart.js pure functions + cart.test.js (acceptance 1–3, quantity never negative, decreasing from 1 removes the line); the reducer in OrderContext may be switched to use them (allowed: Cheny wrote it and nobody else has branched from it yet)." Follow-up typed: "go".

**AI response summary:** The AI created src/utils/cart.js with pure functions that return a new cart and never change the old one: addItem (adds a line or increases the quantity if the product is already in the cart), increaseQty, decreaseQty (decreasing from 1 removes the line), removeItem, lineSubtotal (unit price × quantity), cartTotal (sum of subtotals) and itemCount. The OrderContext reducer now calls these functions instead of doing the math itself, and cartTotal/itemCount in the context use them too, so the screens get the same values as before. cart.test.js has 8 tests using the backend's centavo prices.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 14 passed (6 money + 8 cart): acceptance 1 (9000 / 5000 / 3500, total 17500 = ₱175.00), acceptance 2 (Coffee 3 → 13500, total 22000; back to 2 → 17500), acceptance 3 (remove Soft Drink → 14000), same product twice → one line with qty 2, decrease from 1 → line removed and never negative, item count 4, empty cart → 0, original cart never changed. `npm run build` → OK.

**Commit SHA:** fill in after committing

### AI-M1-06 — Generation — Cheny — 2026-10-07
**Step / branch:** Step 3, Part 2 — feature/frontend-ordering

**Prompt:** "Part 2: ItemSelection + ProductCard + CartPanel: category tabs, large cards, tap to add, − qty +, Remove, subtotal, item count, total, empty state, Proceed disabled when empty, toasts." Follow-up typed: "go". Visual reference: the team's coffee-POS screenshot (product grid left, order panel right).

**AI response summary:** The AI created ProductCard.jsx (the whole card is one large button with an icon, name, category, price and a quantity badge when the product is in the order), CartPanel.jsx ("Your Order" with item count, one line per product with unit price, − qty + buttons, Remove and subtotal, an empty state, the total, and "Proceed to Payment" disabled with "Add at least one item to continue." when the cart is empty), the real ItemSelection.jsx (All / Drinks / Food / Snacks tabs with counts, product grid, cart panel) and ordering.css. Toasts: "Product added — Coffee", "Coffee quantity: 3", "Coffee removed". During the browser check the AI found that with 3 or more lines the Total and Proceed button were pushed below the screen; it changed ordering.css so the selection screen fills exactly one screen and only the menu and the order list scroll.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 14 passed; `npm run build` → OK. Browser (1280×800, backend running): empty cart → ₱0.00 and Proceed disabled with the hint; Coffee ×2 + Sandwich + Soft Drink → ₱90.00 / ₱50.00 / ₱35.00, Total ₱175.00, "4 items"; + Coffee → ₱135.00, Total ₱220.00, toast "Coffee quantity: 3"; − Coffee → Total ₱175.00; Remove Soft Drink → Total ₱140.00, toast "Soft Drink removed"; Drinks tab shows Coffee, Soft Drink, Bottled Water. At 420px wide the layout becomes one column. Known issue (not in this part's files): at phone width the step indicator in base.css is slightly too wide — for the Step 7 refactor.

**Commit SHA:** fill in after committing
