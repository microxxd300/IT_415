# Touchscreen POS Kiosk — IT415

A self-service touchscreen Point of Sale kiosk for a small campus food and merchandise outlet.
Customers tap large product cards, review their order, pay by **Cash**, **QR Payment** or **Credit/Debit Card**
(payments are simulated), and get a digital receipt. Made for the IT415 Application Development and
Emerging Technologies practical examination (BSIT-4C).

**Flow:** Item Selection → Order Summary → Payment Method → Payment → Payment Successful → Receipt → New Transaction

## Features

- 6 products as large tappable cards with category tabs (All / Drinks / Food / Snacks)
- "Your Order" panel: − quantity +, Remove, subtotals, item count and total, updated automatically
- Order Summary with Back (keeps the cart) and Continue to Payment
- Cash payment with an on-screen keypad, quick amounts (Exact, ₱200, ₱500, ₱1,000), live change, and rejection of insufficient payment
- Simulated QR payment (labelled sample QR + steps) and card payment ("Processing payment…" for 2 seconds)
- Payment Successful screen with the transaction number, then a printable digital receipt
- New Transaction clears everything and returns to an empty Item Selection
- A toast message for every action; all buttons are at least 56 px tall; no keyboard needed

## Tech stack and why

| Part | Technology | Why |
|------|------------|-----|
| Backend | Python 3.11+, FastAPI, Pydantic, Uvicorn | Automatic input validation and free Swagger docs at `/docs` |
| Storage | **No database** — products hard-coded in `backend/app/store.py`, transactions kept in memory | A database is not required by the exam; one kiosk needs no shared or historical data, and there is nothing to install. Trade-off: receipts are lost when the server restarts. |
| Frontend | React 18 + Vite, plain JavaScript and CSS | Simple and fast; no router — the current screen lives in React state, so Back keeps the cart |
| Tests | pytest + FastAPI TestClient, Vitest | Backend API and frontend calculations are tested automatically |

**Money is always integer centavos** (₱45.00 = `4500`) in the backend, the API and the frontend state. It is
formatted as "₱1,234.00" only for display, so totals can never be off by a centavo because of decimal math.

## Architecture

```
React kiosk (http://localhost:5173)                     FastAPI backend (http://127.0.0.1:8000)
  screens/ ── useOrder() state (cart, screen, receipt)     routers/ ── /api/products, /api/transactions
  utils/cart.js, payment.js, money.js (tested)    ──JSON──▶ services/pricing.py (prices, totals, cash check)
  api/client.js (errors → readable messages)               services/transactions.py → store.py (in memory)
```

- The frontend sends only **product ids and quantities**. The server looks up every price itself and never trusts client prices.
- The kiosk checks cash for instant feedback, but the **backend is the final authority** and uses the same message.
- A rejected payment saves nothing. References look like `TXN-20261007-143015-001` (date, time and a counter), so they never repeat.

```
backend/   app/ (main.py, store.py, schemas.py, services/, routers/)   tests/
frontend/  src/ (App.jsx, api/, state/, screens/, components/, hooks/, utils/, styles/)
docs/ai-log/   one AI development log per member
```

## Setup and run (Windows PowerShell)

Requirements: Python 3.11 or newer, Node.js 20 or newer.

**Backend** (terminal 1):
```powershell
cd C:\Projects\IT_415_backend\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1          # if blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
pip install -r requirements.txt
uvicorn app.main:app --reload         # → http://127.0.0.1:8000/docs
```

**Frontend** (terminal 2):
```powershell
cd C:\Projects\IT_415_frontend\frontend
npm install
npm run dev                           # → http://localhost:5173
```

Notes:
- Run the commands **inside** the `backend` and `frontend` folders, not the repository root.
- Run **one** uvicorn process (the default). Transaction numbers are unique per server process.
- The frontend calls `http://127.0.0.1:8000` (change with `VITE_API_URL`). The backend only accepts the frontend from port 5173.
- If a payment shows an error, check with staff before paying again (a request that timed out could already be saved).

## Tests

```powershell
cd C:\Projects\IT_415_backend\backend ; .\.venv\Scripts\Activate.ps1 ; pytest      # 55 tests
cd C:\Projects\IT_415_frontend\frontend ; npm test                                  # 29 tests
```

## API

Every error is `{"detail": "<one readable sentence>"}`.

| Method | Path | Result |
|--------|------|--------|
| GET | `/api/health` | 200 `{"status": "ok"}` |
| GET | `/api/products` | 200 list of `{id, name, price, category}` (price in centavos) |
| POST | `/api/transactions` | Body `{"items": [{"product_id": 1, "quantity": 2}], "payment_method": "cash" \| "qr" \| "card", "amount_paid": 20000}` (amount_paid only for cash). 201 receipt · 400 insufficient cash · 422 invalid order |
| GET | `/api/transactions/{reference}` | 200 receipt · 404 "Transaction not found." |

Receipt: `reference, created_at, items[{product_id, name, unit_price, quantity, subtotal}], total, payment_method,
payment_method_label, amount_paid, change, status`.

## Acceptance tests

| # | Action | Expected |
|---|--------|----------|
| 1 | Coffee ×2 + Sandwich ×1 + Soft Drink ×1 | ₱90 / ₱50 / ₱35, total ₱175 |
| 2 | Coffee 2 → 3, then back to 2 | ₱135, total ₱220; back to ₱175 |
| 3 | Remove Soft Drink; Summary; Back | Total ₱140; Summary matches; Back keeps the cart |
| 4 | Cash ₱100 on ₱140 | "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00." — no receipt, nothing saved |
| 5 | Cash ₱200 on ₱140; exact cash | Change ₱60, receipt ₱140 / ₱200 / ₱60 / Cash; exact → ₱0.00 |
| 6 | QR and Card | Succeed, correct method, paid = total, change ₱0.00 |
| 7 | New Transaction; two transactions | Empty cart, ₱0.00; different transaction numbers |

All 7 are covered by automated tests (backend `tests/test_transactions.py`, frontend `utils/*.test.js`) and were checked in the browser.

### Demo checklist
1. Start the backend and the frontend, open http://localhost:5173.
2. Add Coffee ×2, Sandwich, Soft Drink → ₱175.00. + Coffee → ₱220.00, − → ₱175.00. Remove Soft Drink → ₱140.00.
3. Proceed → Summary ₱140.00 → Back keeps the cart → Proceed → Continue → Payment Method.
4. Cash: type 100 → Pay Now → insufficient message, stays on the screen.
5. Clear, ₱200 → Change ₱60.00 → Pay Now → Payment Successful → View Receipt → ₱140 / ₱200 / ₱60 / Cash.
6. New Transaction → empty cart, ₱0.00. Repeat with QR (Confirm Payment) and Card (Processing payment…) → paid ₱140.00, change ₱0.00.
7. Compare two receipts: the transaction numbers are different.

## Group contributions

| ID | Member | GitHub | Branches | Tasks | PR | Reviewer | Merge |
|----|--------|--------|----------|-------|----|----------|-------|
| M1 | Cheny Dalugdog | [hchenii](https://github.com/hchenii) | feature/frontend-setup, feature/frontend-ordering, refactor/frontend-cleanup | React setup, API client, order state, kiosk layout; cart math, Item Selection, Order Summary, Payment Method; refactoring | #2, #3, #7 | Laiza | Merged (0c0df51, 60cfff4, 3bed708) |
| M2 | Laiza Pueblo | [pueblolaiza](https://github.com/pueblolaiza) | feature/frontend-payment, feature/frontend-receipt, docs/readme | Cash keypad, QR and card payments; Payment Successful, receipt, New Transaction; README | #5, #6, #8 | Cheny (#5, #6), Lumpayao (#8) | Merged (f0e42e2, 790f384); #8 this PR |
| M3 | Kurt Lumpayao | [microxxd300](https://github.com/microxxd300) | main (setup), feature/backend-products, feature/backend-transactions | Repository setup; FastAPI app, products; prices, payments, receipts API | #1, #4 | Cheny (#1), Laiza (#4) | Merged (9f2e686, ae32903) |

Reviews that requested changes before approval: PR #1 (CORS on server errors, pinned versions) and PR #2 (request timeout, stale loads, NaN guard, provider check). Every PR was merged with a merge commit after at least one approval.

## AI development logs

AI was used for generation, debugging, refactoring and reviews. Each member's prompts, AI summaries, evaluations and commits are in:
- [docs/ai-log/M1-cheny.md](docs/ai-log/M1-cheny.md)
- [docs/ai-log/M2-laiza.md](docs/ai-log/M2-laiza.md)
- [docs/ai-log/M3-lumpayao.md](docs/ai-log/M3-lumpayao.md)
