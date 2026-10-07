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

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: checkCash uses the exact sentence and the same centavo rule as the backend, so the customer sees the same message whether the kiosk or the server catches it; the keypad cannot produce leading zeros, non-digits or more than ₱100,000. Limitation: the keypad only enters whole pesos, so a customer cannot pay ₱140.50 — fine here because every price is a whole peso.

**Changes we made:** None — accepted as generated.

**Verification:** `npm test` → 25 passed (6 money + 8 cart + 11 payment): "2","0","0" → "200" → 20000 centavos; "0","5" → "5"; back and clear; non-digits ignored; stops at 100000; ₱100 on ₱140 → exact backend sentence; empty → "Please enter the amount paid."; ₱200 on ₱140 → change 6000; exact → 0; not enough → no change shown.

**Commit SHA:** 4042362

### AI-M2-05 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 5, Part 2 — feature/frontend-payment

**Prompt:** "Part 2: Keypad + CashPayment: total, amount-paid display, keypad, quick amounts, live change preview, Pay Now (disabled while the request runs), Change payment method. On success setTransaction(receipt) + goTo('success'); on ApiError show the message and stay on the screen." Follow-up typed: "go".

**AI response summary:** The AI created Keypad.jsx (1–9, Clear, 0, ⌫ in a 3×4 grid of large keys, with spoken labels for screen readers), the real CashPayment.jsx (Total due, large Amount paid display, one feedback panel that shows "Change ₱60.00" in green, "Short by ₱40.00" in red, or the error after Pay Now; quick amounts Exact / ₱200 / ₱500 / ₱1,000 with amounts below the total disabled; Pay Now checks with checkCash first, then calls createTransaction, shows "Processing…" and disables every button while the request runs; on success setTransaction + toast "Transaction completed successfully" + Payment Successful screen; on any error it shows the message and stays) and payment.css. It also added buildPaymentRequest(cart, method, amountPaid) to payment.js (only ids and quantities are sent; the server sets prices) with 2 tests, so the QR and Card screens can reuse it. After the first browser test the error message was moved into the feedback panel because a separate box pushed Pay Now below the screen.

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: acceptance 4 and 5 work in the browser (₱100 rejected and the customer stays, ₱200 → ₱60 change), and the AI proved there is no double payment by slowing the network and counting 0 enabled buttons. Problem found while testing: the separate error box pushed Pay Now below the screen; the AI moved the message into the change panel. Limitation: the same message appears twice for a moment (panel and toast).

**Changes we made:** None to the code; we accepted the layout fix after the browser test.

**Verification:** `npm test` → 27 passed; `npm run build` → OK. Browser (backend running), Coffee ×2 + Sandwich = ₱140.00 → Cash: keypad 1-0-0 → Pay Now → stays on Cash with "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00." (acceptance 4); Clear, 2-0-0 → "Change ₱60.00" → Pay Now → Payment Successful with toast "Transaction completed successfully" (acceptance 5). Exact → paid. With the network slowed by 1 s: button reads "Processing…" and 0 buttons are enabled. With a simulated 400 from the server: stays on Cash, shows the server message, Pay Now enabled again.

**Commit SHA:** 91c0fef

### AI-M2-06 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 5, Part 3 — feature/frontend-payment

**Prompt:** "Part 3: QrPayment and CardPayment per section 7 with the same success/error handling; payment.css." Follow-up typed: "go".

**AI response summary:** The AI moved the "send the payment" logic into a new hook, src/hooks/usePayment.js (Processing state that disables every button, success → setTransaction + toast "Transaction completed successfully" + Payment Successful, error → message shown and stay on the screen), and switched CashPayment to it so the logic exists once. QrPayment.jsx shows the amount, a clearly labelled sample QR drawn as an SVG ("Sample QR · simulated" — it encodes nothing), 3 numbered steps starting with "Scan the QR code using your supported payment application.", Back and Confirm Payment. CardPayment.jsx shows the amount, a card graphic, "Please tap, insert, or swipe your card.", and Process Payment → "Processing payment…" with a spinner for 2 s and all buttons disabled, then the payment is sent. QR and card send no amount_paid; the server sets paid = total.

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: QR and card receipts come back from the real backend with paid = total and ₱0.00 change (acceptance 6), and moving the payment logic into usePayment removed the copy in CashPayment — Cash was re-tested afterwards. Limitations: the QR image is a sample that encodes nothing and the card wait is a fixed 2 s, both allowed because real payment integration is not required; usePayment.js is a new file that was not in the CLAUDE.md ownership table (it is mine, created on my branch).

**Changes we made:** None to the code; we accepted the smaller QR box after the browser showed the buttons slightly below the screen.

**Verification:** `npm test` → 27 passed; `npm run build` → OK. Browser on a ₱140.00 order (responses captured from the real backend): QR → Payment Successful, TXN-20261007-142912-004, QR Payment, total 14000, paid 14000, change 0; Card → "Processing payment…" with 0 enabled buttons, then Payment Successful, TXN-20261007-142916-005, Credit/Debit Card, paid 14000, change 0 (acceptance 6). Cash re-tested after the refactor: ₱100 → stays with the insufficient message and no request sent; ₱200 → paid 20000, change 6000, Cash. Confirm Payment fits on a 674-px-tall window.

**Commit SHA:** e9026f4

### AI-M2-07 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 6, Part 1 — feature/frontend-receipt

**Prompt:** "Part 1: PaymentSuccess screen (all fields + View Receipt + success toast)." Follow-up typed: "go".

**AI response summary:** The AI built PaymentSuccess.jsx: a green check mark beside "Payment Successful", the transaction number in a highlighted box, then Transaction amount, Amount paid, Change and Payment method — all read from the receipt the server returned (state.transaction), nothing recalculated on the kiosk — and a View Receipt button. The success toast "Transaction completed successfully" is already shown by usePayment when the screen opens, so it is not shown twice. If there is no transaction (for example the screen is reached by mistake), it shows "No completed payment" with a New Transaction button. Styles are in the new receipt.css. After the browser check the check mark was moved beside the title because View Receipt was below the screen.

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: every value on the screen comes from the receipt the server returned, so the screen cannot show a different amount than what was saved; the toast is not repeated because usePayment already shows it. Problem found while testing: View Receipt was below the screen, fixed by putting the check mark beside the title. Limitation: the "No completed payment" fallback can only be reached by a bug, so it was not tested in the browser.

**Changes we made:** None to the code; we accepted the compact layout after the browser test.

**Verification:** `npm test` → 27 passed; `npm run build` → OK. Browser: Coffee ×2 + Sandwich, Cash ₱200 → Payment Successful: TXN-20261007-144742-007, Transaction amount ₱140.00, Amount paid ₱200.00, Change ₱60.00, Payment method Cash, toast "Transaction completed successfully"; View Receipt fits on a 674-px-tall window.

**Commit SHA:** af68c53

### AI-M2-08 — Generation — Laiza — 2026-10-07
**Step / branch:** Step 6, Part 2 — feature/frontend-receipt

**Prompt:** "Part 2: Receipt screen loaded with getTransaction(reference) (loading + error states), all fields, optional Print via window.print() with print CSS in receipt.css." Follow-up typed: "go".

**AI response summary:** The AI built Receipt.jsx: it loads the saved receipt from the server with getTransaction(reference) (which proves the transaction was really saved), shows "Loading receipt…" while waiting, and on error shows the server message with Try again and New Transaction (stale answers are ignored, like App.jsx). The receipt "paper" shows CAMPUS STORE POS, Transaction No., date and time (e.g. "October 7, 2026 at 2:49 PM"), each item as qty × unit price with its subtotal, then Total, Payment method, Amount paid, Change, Status and a thank-you line. A side panel has "🖨 Print receipt" (window.print()) and New Transaction. receipt.css got the receipt styles and print CSS that prints only the receipt (80 mm wide, no header, step bar, buttons or toast).

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: the receipt is loaded again from the server by its reference, which proves the transaction was saved, and the values matched acceptance 5 and 6 exactly; the error state was tested by forcing a 404. Limitations: the print preview was not checked automatically (I check it by hand), and receipts cannot be loaded after the backend restarts because there is no database.

**Changes we made:** None — accepted as generated.

**Verification:** `npm test` → 27 passed; `npm run build` → OK. Browser: Cash ₱200 on ₱140 → View Receipt → CAMPUS STORE POS, TXN-20261007-144944-008, October 7, 2026 at 2:49 PM, Coffee 2 × ₱45.00 = ₱90.00, Sandwich 1 × ₱50.00 = ₱50.00, Total ₱140.00, Cash, Amount paid ₱200.00, Change ₱60.00, Payment Successful (acceptance 5); New Transaction button visible without scrolling. QR order with the receipt request forced to 404 → "Transaction not found." with Try again and New Transaction → Try again → QR receipt: Total ₱140.00, QR Payment, paid ₱140.00, change ₱0.00 (acceptance 6). Print preview not tested automatically — check by hand.

**Commit SHA:** 721cc8c

### AI-M2-09 — Review — Laiza — 2026-10-07
**Step / branch:** Step 6, Part 3 — feature/frontend-receipt

**Prompt:** "Part 3: New Transaction → newTransaction(); verify everything is cleared and the old reference never reappears; list manual steps for acceptance 5–7." Follow-up typed: "go".

**AI response summary:** The AI checked that New Transaction on the Receipt already calls newTransaction() (built by Cheny in Step 2), so no code change was needed, and proved acceptance 5–7 in the browser against the real backend with a script that taps the real buttons. It wrote the demo checklist below.

**Evaluation:** (Drafted with AI help at Laiza's request.) Correct: the AI did not add code that was not needed — New Transaction already worked — and instead proved acceptance 5–7 with real button taps against the real backend, including that the old reference disappears and the category resets. Limitation: the check is a one-time browser script, not an automated test that runs with npm test.

**Changes we made:** None; we keep the demo checklist for the presentation.

**Verification:** Browser, order Coffee ×2 + Sandwich = ₱140.00 each time:
- Acceptance 5 — Cash ₱200: TXN-20261007-145149-011, Total ₱140.00, Cash, paid ₱200.00, change ₱60.00. Cash Exact: TXN-…-012, paid ₱140.00, change ₱0.00.
- Acceptance 6 — QR: TXN-…-013, QR Payment, paid ₱140.00, change ₱0.00. Card: TXN-…-014, Credit/Debit Card, paid ₱140.00, change ₱0.00.
- Acceptance 7 — after New Transaction: Menu screen, "0 items", Total ₱0.00, Proceed disabled, category back to "All" (it was "Snacks"), toast "New transaction started — previous order cleared", the old reference appears nowhere on the page; all 4 references are different.

**Demo checklist (for the instructor):**
1. Start the backend (`uvicorn app.main:app --reload` in backend/ with .venv active) and the frontend (`npm run dev` in frontend/), open http://localhost:5173.
2. Add Coffee ×2, Sandwich, Soft Drink → ₱90 / ₱50 / ₱35, Total ₱175.00. + Coffee → ₱220.00, − → ₱175.00. Remove Soft Drink → ₱140.00.
3. Proceed → Summary ₱140.00 → Back keeps the cart → Proceed → Continue → Payment Method.
4. Cash: type 100 → Pay Now → "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00." and stay.
5. Clear, ₱200 → Change ₱60.00 → Pay Now → Payment Successful → View Receipt → ₱140 / ₱200 / ₱60 / Cash.
6. New Transaction → empty cart, ₱0.00, toast. Repeat the order with QR (Confirm Payment) and with Card (Processing payment… 2 s) → paid ₱140.00, change ₱0.00.
7. Compare the transaction numbers of two receipts: they are different.

**Commit SHA:** fill in after committing
