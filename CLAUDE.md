# IT415 TOUCHSCREEN POS KIOSK — MASTER PROMPT

Project instructions: sections 0–11 of the team's master prompt, verbatim.

## 0. Team configuration
| ID | Member | Full name | GitHub username | Commit email | Git remote | Works in |
|----|--------|-----------|-----------------|--------------|------------|----------|
| M1 | Cheny | Cheny Dalugdog | hchenii | chenybabesdalogdug@gmail.com | cheny | C:\Projects\IT_415_frontend |
| M2 | Laiza | Laiza Pueblo | pueblolaiza | pueblo.laiza@dnsc.edu.ph | laiza | C:\Projects\IT_415_frontend |
| M3 | Lumpayao | Kurt Lumpayao | microxxd300 | lumpayao.kurt@dnsc.edu.ph | origin | C:\Projects\IT_415_backend |
- Repository: https://github.com/microxxd300/IT_415 (owner: microxxd300) — integration branch: main.
- Remotes: in C:\Projects\IT_415_backend, origin = https://microxxd300@github.com/microxxd300/IT_415.git.
  In C:\Projects\IT_415_frontend, origin = https://github.com/microxxd300/IT_415.git (used only for pulling),
  cheny = https://hcheniii@github.com/microxxd300/IT_415.git, laiza = https://pueblolaiza@github.com/microxxd300/IT_415.git.
  (Cheny's real GitHub username is hchenii; the extra "i" in the cheny remote URL is harmless — Git Credential Manager signs in as hchenii.)
- Both folders are clones of the SAME repository (monorepo with backend/ and frontend/).
  Backend work happens ONLY in C:\Projects\IT_415_backend\backend. Frontend work happens ONLY in C:\Projects\IT_415_frontend\frontend.
- Work split: Cheny and Laiza share the UI equally (3 PRs each). Lumpayao does the backend.
- Before each member's first push, remind them to make sure the browser is logged into THEIR GitHub account (or to use a private window),
  because Git Credential Manager opens a browser sign-in and saves whichever account is logged in.

## 1. Goal
Self-service touchscreen POS kiosk for a small campus food & merchandise outlet.
Flow: Item Selection → Order Summary → Payment Method → Payment Processing → Payment Successful → Receipt → New Transaction (back to empty Item Selection).
A simple app that works and that we can explain line by line beats a complicated one.

## 2. Tech stack and why
- Backend: Python 3.11+, FastAPI, Pydantic, Uvicorn. Input is validated automatically and Swagger docs are served at /docs.
- Storage: NO database (team decision, 2026-10-07, during review of feature/backend-products). Products are hard-coded in backend/app/store.py;
  completed transactions are kept in memory (a dict + counter + lock in store.py) while the server runs.
  Why: a database is not required by the exam, one kiosk needs no shared or historical data, and there is nothing to install or configure.
  Trade-off: receipts are lost when the server restarts; references include date + time so they never repeat across restarts.
- Frontend: React 18 + Vite, plain JavaScript, plain CSS. No router: the current screen lives in React state, so Back keeps the cart.
- Tests: pytest + FastAPI TestClient (backend); Vitest for pure utility functions (frontend).
- ALL money is INTEGER CENTAVOS (backend, API, state). Format as "₱1,234.00" only for display. Never do float math on pesos.

## 3. Run commands (Windows PowerShell)
- Backend: cd C:\Projects\IT_415_backend\backend ; py -m venv .venv ; .\.venv\Scripts\Activate.ps1 ; pip install -r requirements.txt ; uvicorn app.main:app --reload  → http://127.0.0.1:8000/docs ; tests: pytest
  (If activation is blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned)
- Frontend: cd C:\Projects\IT_415_frontend\frontend ; npm install ; npm run dev → http://localhost:5173 ; tests: npm test
- The frontend reads VITE_API_URL (default http://127.0.0.1:8000). The backend allows CORS from http://localhost:5173 and http://127.0.0.1:5173.
- While a backend branch is not merged yet, run the backend from C:\Projects\IT_415_backend on that branch so the frontend has an API to call.

## 4. API contract (the backend implements exactly this; the frontend relies on it)
Every error response is {"detail": "<one human-readable sentence>"} — validation errors are converted to this format too.
- GET /api/health → 200 {"status": "ok"}
- GET /api/products → 200 [{"id": 1, "name": "Coffee", "price": 4500, "category": "Drinks"}, ...]
- POST /api/transactions
  body: {"items": [{"product_id": 1, "quantity": 2}], "payment_method": "cash" | "qr" | "card", "amount_paid": 20000}
  amount_paid is required for cash and ignored for qr/card (for those, amount_paid = total and change = 0).
  201 → Receipt
  400 → insufficient cash: "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00."
  422 → empty items, unknown product, quantity < 1 or more than 99 per product, missing/invalid/negative amount_paid for cash, invalid method.
  The server recomputes every price and total from its own product list and never trusts client prices. A rejected payment saves NOTHING.
- GET /api/transactions/{reference} → 200 Receipt | 404 "Transaction not found."
- Receipt = {"reference": "TXN-20261007-143015-001", "created_at": ISO datetime, "items": [{"product_id", "name", "unit_price", "quantity", "subtotal"}], "total",
  "payment_method": "cash", "payment_method_label": "Cash" | "QR Payment" | "Credit/Debit Card", "amount_paid", "change", "status": "Payment Successful"}
- Reference = "TXN-" + YYYYMMDD + "-" + HHMMSS + "-" + zero-padded 3-digit in-memory counter (e.g. TXN-20261007-143015-001),
  created only when the transaction is saved. The counter restarts with the server; the date and time keep references unique.

## 5. Backend structure (owner: M3 Lumpayao)
backend/requirements.txt (fastapi, uvicorn[standard], pydantic, pytest, httpx)
backend/app/main.py — app, CORS, {"detail"} error handlers, routers
backend/app/store.py — in-memory data: PRODUCTS (hard-coded), and (Step 4) the transactions dict, counter and lock
backend/app/schemas.py — Pydantic models
backend/app/services/pricing.py — pure functions: format_peso, build_lines, calculate_total, validate_cash, compute_change
backend/app/services/transactions.py — create_transaction (validate everything first, then save under the lock), get_transaction
backend/app/routers/products.py, backend/app/routers/transactions.py
backend/tests/ — tests clear the in-memory transactions before each test

## 6. Frontend structure, ownership and contract
Created by M1 Cheny in feature/frontend-setup, then FROZEN (only the refactor step may edit them):
frontend/package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/state/OrderContext.jsx, src/api/client.js, src/utils/money.js,
src/components/Header.jsx, src/components/StepIndicator.jsx, src/components/Toast.jsx, src/styles/base.css,
plus a placeholder file for EVERY screen (title + Back/Continue only), so later branches never create shared files.
| Owner | Files |
|-------|-------|
| M1 Cheny | src/utils/cart.js + cart.test.js, src/utils/money.test.js, src/components/ProductCard.jsx, src/components/CartPanel.jsx, src/screens/ItemSelection.jsx, src/screens/OrderSummary.jsx, src/screens/PaymentMethod.jsx, src/styles/ordering.css |
| M2 Laiza | src/utils/payment.js + payment.test.js, src/components/Keypad.jsx, src/screens/CashPayment.jsx, src/screens/QrPayment.jsx, src/screens/CardPayment.jsx, src/screens/PaymentSuccess.jsx, src/screens/Receipt.jsx, src/styles/payment.css, src/styles/receipt.css, README.md (in the docs step) |
| M3 Lumpayao | backend/**, CLAUDE.md, .gitignore, .claude/settings.json |
| Each member | only their own docs/ai-log/<ID>-<name>.md |
Contract:
- api/client.js: getProducts(), createTransaction(payload), getTransaction(reference). Non-2xx responses throw ApiError {message: detail, status};
  a network failure throws ApiError("Cannot reach the server. Please ask staff for help.", 0).
- utils/money.js: formatPeso(centavos) → "₱1,234.00"
- state/OrderContext.jsx exposes useOrder() → { state: { screen, category, products, cart: [{productId, name, unitPrice, qty}], transaction },
  addItem(product), increase(id), decrease(id), remove(id), setCategory(c), goTo(screen), setTransaction(receipt), newTransaction(), cartTotal, itemCount,
  setProducts(products) (added in Step 2 so App can store the loaded products) }
  and useToast() → showToast(message, type: 'info' | 'success' | 'error').
- Screens: 'selection', 'summary', 'method', 'cash', 'qr', 'card', 'success', 'receipt'.
- newTransaction(): clears cart, transaction and category; goes to 'selection'; toast "New transaction started — previous order cleared". Products stay loaded.

## 7. Business rules and touchscreen UI
- Products (hard-coded in the backend): Coffee ₱45 Drinks, Sandwich ₱50 Food, Soft Drink ₱35 Drinks, Cookies ₱25 Snacks, Bottled Water ₱20 Drinks, Chocolate ₱25 Snacks. Category tabs: All / Drinks / Food / Snacks.
- Subtotal = unit price × qty; Total = sum of subtotals. Quantity never goes below 0; decreasing from 1 removes the line; every line has a Remove button.
  Maximum 99 per product (review suggestion on PR #3): the backend rejects more; the frontend should stop at 99 with a toast (Step 7).
- "Proceed to Payment" is disabled when the cart is empty, with an explanation. Back from Order Summary keeps the cart.
- Cash: on-screen keypad 0–9 + Clear and quick amounts (Exact, ₱200, ₱500, ₱1,000), no keyboard typing. The frontend pre-checks for instant feedback; the backend is the final authority.
  On rejection, stay on the screen and show the message. Exact amount → ₱0.00 change.
- QR: amount, a clearly labeled QR placeholder, 3 numbered instructions ("Scan the QR code using your supported payment application."), Back, Confirm Payment.
- Card: amount, "Please tap, insert, or swipe your card.", Process Payment → "Processing payment…" for ~2 s with all buttons disabled (no double payment), then call the API.
- Payment Successful screen: amount, amount paid, change, method, reference, View Receipt.
- Receipt: "CAMPUS STORE POS", reference, date and time, items (qty × unit price, subtotal), total, method, amount paid, change, status, New Transaction (Print optional).
- A failed payment never shows a success screen or a receipt. Every API error is shown to the user.
- UI: kiosk header "Campus Store · Self-service kiosk", step indicator (1 Order · 2 Review · 3 Payment · 4 Receipt), product grid left + "Your Order" panel right,
  buttons at least 56px tall, large cards, base font at least 18px, generous spacing, no hover-only actions, a toast for every action
  ("Product added — Coffee", "Coffee removed", "Insufficient payment…", "Transaction completed successfully").

## 8. Acceptance tests (the instructor runs these)
1. Coffee×2 + Sandwich×1 + Soft Drink×1 → 90 / 50 / 35, total ₱175.
2. Coffee 2→3 → ₱135, total ₱220; back to 2 → ₱175.
3. Remove Soft Drink → ₱140; Summary matches; Back keeps the cart.
4. Cash ₱100 on ₱140 → rejected, no receipt, nothing saved.
5. Cash ₱200 on ₱140 → change ₱60 → receipt ₱140 / ₱200 / ₱60 / Cash; exact cash → ₱0.00.
6. QR and Card succeed; correct method; paid = total; change ₱0.00.
7. New Transaction → empty cart, ₱0.00; two transactions get different references.

## 9. Rules for you, Claude
- GIT: you may run READ-ONLY git commands (status, log, diff, branch, fetch, remote -v). NEVER run git add/commit/push/merge/rebase/checkout/switch/config, and never run gh.
  Instead, print the exact PowerShell commands (starting with cd into the correct clone) for the member at the keyboard to type themselves.
- NEVER add "Co-Authored-By", "Generated with Claude Code", session links, or any AI attribution to commit messages, PR text, code, comments or docs.
  AI use is documented honestly ONLY in docs/ai-log/.
- Edit ONLY the files owned by the member of the current step. If another member's file seems to need a change, STOP and tell us.
- Never work on more than one step at a time and never skip ahead, even if asked to "do everything". Explain that it would erase the per-member evidence the exam grades.
- For every part: (a) show a short plan + file list and wait for "go"; (b) implement; (c) run the tests; (d) list manual browser or Swagger checks with expected peso values;
  (e) append an AI log entry to the member's docs/ai-log file (format below); (f) suggest ONE commit message `type(scope): description` (feat, fix, refactor, test, docs, chore)
  and print the commit commands; (g) STOP and wait for "next".
- AI log entry format (leave the two TODO fields for the member to write in their own words before committing):
  ### AI-<M#>-<##> — <Generation | Debugging | Refactoring | Review> — <member> — <date>
  **Step / branch:** … **Prompt:** the exact instruction for this part (quote the step text from section 10 plus any follow-up the member typed)
  **AI response summary:** … **Evaluation:** TODO (member writes: what was correct / wrong / missing / limitations)
  **Changes we made:** TODO (member writes) **Verification:** tests and manual checks with results **Commit SHA:** fill in after committing
- After each part, explain the new code in plain language (3–6 sentences) so the member can explain it to the instructor.
- If a command or test fails, show the exact error and the root cause before changing anything.

## 10. WORKFLOW — strictly in order; each step waits for "merged" before the next one starts
START-OF-STEP procedure (every step):
1. Announce: "STEP N — <member> at the keyboard — branch <branch> — folder <clone>".
2. Print the commands for the member to type (using the values from section 0):
   cd <clone> ; git checkout main ; git pull origin main ; git config user.name "<full name>" ; git config user.email "<commit email>" ;
   git config user.name   (verify it prints the right person) ; git checkout -b <branch>
3. Wait for "ready", then begin Part 1 with the plan.
END-OF-STEP procedure (after the last part):
1. Print: git checkout main ; git pull origin main ; git checkout <branch> ; git merge main ; (run the tests) ;
   git log origin/main..HEAD --format="%h  %an <%ae>"   (only this member may appear) ;
   git log origin/main..HEAD -i --grep="claude" --grep="anthropic"   (must print nothing) ;
   git push -u <member's remote> <branch>
2. Print a ready-to-paste PR: Title | Source branch → target main | Member | Summary | Files changed | How to test (with expected peso values) | AI log IDs |
   Checklist [ ] tests pass [ ] only my files changed [ ] merged latest main [ ] no AI attribution. Say: open it on GitHub while logged in as this member.
3. Name the reviewer (table below) and tell them to type: review <branch> as <name>. Remind: merge with "Create a merge commit" (not squash) and keep the branch.
4. Wait for "merged". Then print `git checkout main ; git pull origin main` for BOTH clones.

| Step | Member | Branch | Clone | Reviewer |
|------|--------|--------|-------|----------|
| 0 | Lumpayao | main (direct, first commit) | C:\Projects\IT_415_backend | — |
| 1 | Lumpayao | feature/backend-products | C:\Projects\IT_415_backend | Cheny |
| 2 | Cheny | feature/frontend-setup | C:\Projects\IT_415_frontend | Laiza |
| 3 | Cheny | feature/frontend-ordering | C:\Projects\IT_415_frontend | Laiza |
| 4 | Lumpayao | feature/backend-transactions | C:\Projects\IT_415_backend | Laiza |
| 5 | Laiza | feature/frontend-payment | C:\Projects\IT_415_frontend | Cheny |
| 6 | Laiza | feature/frontend-receipt | C:\Projects\IT_415_frontend | Cheny |
| 7 | Cheny | refactor/frontend-cleanup | C:\Projects\IT_415_frontend | Laiza |
| 8 | Laiza | docs/readme | C:\Projects\IT_415_frontend | Lumpayao |
| 9 | Lumpayao | (main, read-only final check) | both | — |

STEP 0 — Lumpayao, repository setup (no branch; this is the first commit on main):
 Part 1: in C:\Projects\IT_415_backend create CLAUDE.md containing sections 0–11 of this message verbatim (so any new session has full context);
 .claude/settings.json = {"attribution": {"commit": "", "pr": "", "sessionUrl": false}};
 .gitignore (Python: .venv, __pycache__, *.db, .pytest_cache; Node: node_modules, dist; editor files); README.md (title + "In progress");
 docs/ai-log/M1-cheny.md, M2-laiza.md, M3-lumpayao.md (a heading each). Do not create backend/ or frontend/.
 End: print the commit command and `git branch -M main ; git push -u origin main`. Then tell microxxd300 to add a rule for main
 (Settings → Branches or Rules → Rulesets: require a pull request before merging, 1 approval) and to confirm that hchenii and pueblolaiza
 have ACCEPTED their collaborator invites. Print `git pull origin main` for the frontend clone. Wait for "done" (no PR for this step).
STEP 1 — Lumpayao, feature/backend-products:
 Part 1: requirements.txt, app/main.py with CORS + {"detail"} error handlers + GET /api/health, tests/test_health.py.
 Part 2: app/database.py (tables, seed, KIOSK_DB), Product schema, GET /api/products, tests using a temporary DB. Explain how to verify in Swagger /docs.
 (Changed during review: SQLite removed; products are hard-coded in app/store.py. See section 2.)
STEP 2 — Cheny, feature/frontend-setup:
 Part 1: scaffold Vite + React (JavaScript) in frontend/ (if create-vite asks interactive questions, create the files manually), add Vitest with an "npm test" script,
 src/api/client.js, src/utils/money.js + money.test.js.
 Part 2: OrderContext.jsx exactly per section 6 (useReducer), Header, StepIndicator, Toast, base.css (kiosk look, touch sizes), App.jsx that loads products
 (loading + error states) and switches between all 8 screens, with placeholder files for every screen so the full flow is clickable.
STEP 3 — Cheny, feature/frontend-ordering:
 Part 1: src/utils/cart.js pure functions + cart.test.js (acceptance 1–3, quantity never negative, decreasing from 1 removes the line);
 the reducer in OrderContext may be switched to use them (allowed: Cheny wrote it and nobody else has branched from it yet).
 Part 2: ItemSelection + ProductCard + CartPanel: category tabs, large cards, tap to add, − qty +, Remove, subtotal, item count, total, empty state, Proceed disabled when empty, toasts.
 Part 3: OrderSummary (table, item count, total, Back keeps the cart, Continue to Payment) and PaymentMethod (amount due, 3 large buttons with descriptions, Back to Order); ordering.css.
STEP 4 — Lumpayao, feature/backend-transactions:
 Part 1: services/pricing.py + tests/test_pricing.py (175 → 220 → 140; ₱100 on ₱140 rejected with the exact message; ₱200 → ₱60; exact → 0).
 Part 2: POST /api/transactions per section 4 (Pydantic validation, server-side prices, cash validation, qr/card paid = total,
 validate everything before saving, save the transaction in memory under a lock, reference from date + time + counter, nothing saved on rejection).
 Part 3: GET /api/transactions/{reference} + tests/test_transactions.py for acceptance 4–7 (different references; a rejected payment saves nothing).
STEP 5 — Laiza, feature/frontend-payment:
 Part 1: src/utils/payment.js (parse keypad amount, pre-validate cash with the same message format as the backend, change preview) + payment.test.js.
 Part 2: Keypad + CashPayment: total, amount-paid display, keypad, quick amounts, live change preview, Pay Now (disabled while the request runs), Change payment method.
 On success setTransaction(receipt) + goTo('success'); on ApiError show the message and stay on the screen.
 Part 3: QrPayment and CardPayment per section 7 with the same success/error handling; payment.css.
STEP 6 — Laiza, feature/frontend-receipt:
 Part 1: PaymentSuccess screen (all fields + View Receipt + success toast).
 Part 2: Receipt screen loaded with getTransaction(reference) (loading + error states), all fields, optional Print via window.print() with print CSS in receipt.css.
 Part 3: New Transaction → newTransaction(); verify everything is cleared and the old reference never reappears; list manual steps for acceptance 5–7.
STEP 7 — Cheny, refactor/frontend-cleanup (may edit any file in frontend/):
 Run npm test first and report the result. One part per refactor (duplicated logic, unclear names, oversized components, calculations that belong in src/utils/).
 Show BEFORE/AFTER snippets and why each is better. Behavior must not change; npm test after each part. Log type: Refactoring.
STEP 8 — Laiza, docs/readme:
 README.md: description, features, tech stack + why, architecture, Windows setup/run for backend and frontend, tests, API endpoint table, acceptance tests,
 "Group contributions" table (ID | member | GitHub username | branches | tasks | PR #s | reviewer | merge status) filled from `git log --merges --oneline main`
 and section 0; links to docs/ai-log/*. Do not edit anyone's Evaluation or Changes text.
STEP 9 — Lumpayao, final check (read-only):
 Run pytest and npm test on the latest main. Trace acceptance 1–7 through the code. Report PASS/FAIL with reasons and the manual demo checklist.
 Print `git log -1 --format=%H` (the final integration commit SHA). Change nothing.

## 11. Commands we may type at any time
- "review <branch> as <name>": read-only. Run git fetch origin and git diff origin/main...origin/<branch>. Check against sections 4–8, file ownership, centavo math,
  validation, error handling, readability and duplication. Give numbered issues (file, line, why, fix), ranked by severity. Change no code.
  Print a Review AI log entry for the reviewer to add to their own log in their next commit. Remind them to post the comments on GitHub in their own words,
  logged in as themselves.
- "fix review: <pasted comments>": the PR author fixes them on the PR branch, one part per comment; commit message "fix(<scope>): address review — <short>";
  draft replies to each comment; then print the push command (the PR updates automatically).
- "bug: expected <…>, actual <…>, steps <…>, error <…>": find and explain the root cause first, then propose the smallest fix + a regression test. Wait for "go".
  If no branch is open, print the start-of-step commands for fix/<short-name> for the member who found the bug, with the normal END-OF-STEP procedure. Log type: Debugging.
- "conflict": after git merge main reports conflicts, show what each side changed per file and propose a resolution following ownership; wait for "go"; run the tests.
- "status": show the current step and part, merged PRs (git log --merges --oneline main) and what comes next.
- "explain <file or function>": a plain-language explanation for demo preparation.
If this conversation restarts or loses context, re-read C:\Projects\IT_415_backend\CLAUDE.md and run "status".
