# AI Development Log — M2 Laiza Pueblo

### AI-M2-01 — Review — Laiza — 2026-10-07
**Step / branch:** Review of PR #2 feature/frontend-setup (Step 2, author M1 Cheny)

**Prompt:** "review feature/frontend-setup as Laiza"

**AI response summary:** The AI checked PR #2 (23 files) against the frontend contract, file ownership, centavo math, error handling and readability, and reloaded the app in a browser. It reported: (1) MEDIUM — client.js fetch has no timeout, so a frozen server leaves the kiosk stuck on Loading or on card Processing with all buttons disabled; fix with AbortSignal.timeout. (2) LOW — App.jsx product-loading effect has no cleanup; the Network tab showed 2 GET /api/products requests (StrictMode), and a late failure could show the error screen. (3) LOW — formatPeso(undefined) returns "₱NaN.NaN". (4) NIT — useCurrentToast has no provider check. (5) NOTE — setProducts is not in the CLAUDE.md contract. Verdict: request changes, because client.js is frozen after this PR.

**Evaluation:** (Drafted with AI help.) Correct: the timeout problem matters for my own Step 5 screens — without it the card screen could stay on "Processing payment…" forever — and the double request was shown in the Network tab rather than guessed. The NOTE about setProducts was for Kurt, not Cheny. Limitation: the AI found the issues but I had to post them on GitHub myself.

**Changes we made:** Posted items 1–4 as one "Request changes" review on PR #2, using the AI's suggested wording; item 5 was passed to Kurt (fixed in CLAUDE.md in PR #4).

**Verification:** Cheny fixed all 4 items (1242f7b, b99644a, 3ab0e36, 6a2a135); I re-checked and approved ("All 4 fixes look good, tests pass. Approved.") and merged PR #2 as 0c0df51.

**Commit SHA:** 4042362

### AI-M2-02 — Review — Laiza — 2026-10-07
**Step / branch:** Review of PR #3 feature/frontend-ordering (Step 3, author M1 Cheny)

**Prompt:** "review feature/frontend-ordering as Laiza" (typed as "next")

**AI response summary:** The AI checked PR #3 (10 files) against the frontend contract, ownership, centavo math, the acceptance tests and readability. No blocking issues; verdict Approve. Non-blocking suggestions: (1) no maximum quantity — cap at 99; (2) category tabs are hard-coded instead of built from the products; (3) duplicated "item/items" text and .btn-block in ordering.css — for the Step 7 refactor; (4) tab group needs role="group", aria-label on a span is ignored; (5) .kiosk:has() in ordering.css depends on base.css class names.

**Evaluation:** (Drafted with AI help.) Correct: the totals ₱175 → ₱220 → ₱140, Back keeping the cart and the disabled Proceed button were already verified in the browser, so approving was safe. The 99 maximum was a good catch — Kurt added it to the backend in PR #4. Limitation: the suggestions are small and were left for Cheny's Step 7 instead of being fixed before the merge.

**Changes we made:** Posted an Approve review with suggestions 1–3 in my own summary; left 4 and 5 for Step 7.

**Verification:** Approved and merged PR #3 as 60cfff4.

**Commit SHA:** 4042362

### AI-M2-03 — Review — Laiza — 2026-10-07
**Step / branch:** Review of PR #4 feature/backend-transactions (Step 4, author M3 Lumpayao)

**Prompt:** "review feature/backend-transactions as Laiza" (started after Kurt typed "done")

**AI response summary:** The AI checked PR #4 (13 files) against the API contract, ownership, centavo math, validation and the acceptance tests, and ran two edge cases against the code. Verdict: Approve. Findings: (1) LOW — {"items": [5]} returns "Your order must contain at least one item." although the order is not empty (confirmed); (2) LOW — amount_paid has no maximum: 10^15 was accepted with a huge change (confirmed); (3) NOTE — references are unique per server process, so the README must say to run one uvicorn process; (4) NIT — raise HTTPException ... from error.

**Evaluation:** (Drafted with AI help.) Correct: both edge cases were proven by running them, not guessed, and the API matches what my payment screens need (201 receipt, 400 with the exact insufficient-cash sentence, paid = total for QR/card). Limitation: neither edge case can happen through the kiosk screens (the keypad sends whole numbers and the cart never sends a bare number), so they were not blocking.

**Changes we made:** Posted an Approve review mentioning items 1–3; I will add the single-process note to the README in Step 8.

**Verification:** Approved and merged PR #4 as ae32903.

**Commit SHA:** 4042362

### AI-M2-04 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 5, Part 1 — feature/frontend-payment

**Prompt:** "Part 1: src/utils/payment.js (parse keypad amount, pre-validate cash with the same message format as the backend, change preview) + payment.test.js." Follow-up typed: "go".

**AI response summary:** The AI created src/utils/payment.js: pressKey(entry, key) builds the keypad entry from digit keys, 'clear' and 'back', drops leading zeros and never goes above ₱100,000 (the cash limit suggested in my PR #4 review); entryToCentavos("200") → 20000 (null when empty); checkCash(paid, total) returns ok or the same sentence as the backend ("Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00.", or "Please enter the amount paid." when empty); changeFor(paid, total) returns paid − total, or null while the amount is not enough. payment.test.js has 11 tests.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 25 passed (6 money + 8 cart + 11 payment): "2","0","0" → "200" → 20000 centavos; "0","5" → "5"; back and clear; non-digits ignored; stops at 100000; ₱100 on ₱140 → exact backend sentence; empty → "Please enter the amount paid."; ₱200 on ₱140 → change 6000; exact → 0; not enough → no change shown.

**Commit SHA:** 4042362

### AI-M2-05 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 5, Part 2 — feature/frontend-payment

**Prompt:** "Part 2: Keypad + CashPayment: total, amount-paid display, keypad, quick amounts, live change preview, Pay Now (disabled while the request runs), Change payment method. On success setTransaction(receipt) + goTo('success'); on ApiError show the message and stay on the screen." Follow-up typed: "go".

**AI response summary:** The AI created Keypad.jsx (1–9, Clear, 0, ⌫ in a 3×4 grid of large keys, with spoken labels for screen readers), the real CashPayment.jsx (Total due, large Amount paid display, one feedback panel that shows "Change ₱60.00" in green, "Short by ₱40.00" in red, or the error after Pay Now; quick amounts Exact / ₱200 / ₱500 / ₱1,000 with amounts below the total disabled; Pay Now checks with checkCash first, then calls createTransaction, shows "Processing…" and disables every button while the request runs; on success setTransaction + toast "Transaction completed successfully" + Payment Successful screen; on any error it shows the message and stays) and payment.css. It also added buildPaymentRequest(cart, method, amountPaid) to payment.js (only ids and quantities are sent; the server sets prices) with 2 tests, so the QR and Card screens can reuse it. After the first browser test the error message was moved into the feedback panel because a separate box pushed Pay Now below the screen.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `npm test` → 27 passed; `npm run build` → OK. Browser (backend running), Coffee ×2 + Sandwich = ₱140.00 → Cash: keypad 1-0-0 → Pay Now → stays on Cash with "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00." (acceptance 4); Clear, 2-0-0 → "Change ₱60.00" → Pay Now → Payment Successful with toast "Transaction completed successfully" (acceptance 5). Exact → paid. With the network slowed by 1 s: button reads "Processing…" and 0 buttons are enabled. With a simulated 400 from the server: stays on Cash, shows the server message, Pay Now enabled again.

**Commit SHA:** fill in after committing
