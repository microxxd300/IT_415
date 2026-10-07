# AI Development Log — M3 Kurt Lumpayao

### AI-M3-01 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 0, Part 1 — main (first commit, repository setup)

**Prompt:** "Part 1: in C:\Projects\IT_415_backend create CLAUDE.md containing sections 0–11 of this message verbatim (so any new session has full context); .claude/settings.json = {"attribution": {"commit": "", "pr": "", "sessionUrl": false}}; .gitignore (Python: .venv, __pycache__, *.db, .pytest_cache; Node: node_modules, dist; editor files); README.md (title + "In progress"); docs/ai-log/M1-cheny.md, M2-laiza.md, M3-lumpayao.md (a heading each). Do not create backend/ or frontend/." Follow-up typed: "go".

**AI response summary:** The AI created CLAUDE.md with sections 0–11 of the master prompt, .claude/settings.json turning off AI attribution in commits and PRs, a .gitignore for Python, Node, editor and OS files (it also ignores .env files and .claude/settings.local.json), a placeholder README.md, and one AI log file per member. It did not create backend/ or frontend/ and did not run any git write commands.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: all 7 files were created, CLAUDE.md matches sections 0–11 and the .gitignore keeps .venv, kiosk.db and node_modules out of the repo. Missing: no .gitattributes, so Git later showed "LF will be replaced by CRLF" warnings on Windows (harmless). Limitation: the AI cannot check GitHub settings, so the branch rule and collaborator invites had to be checked by hand.

**Changes we made:** None — the files were accepted as generated.

**Verification:** `git status` lists exactly 7 new files (CLAUDE.md, .claude/settings.json, .gitignore, README.md, docs/ai-log/M1-cheny.md, M2-laiza.md, M3-lumpayao.md); no .db, .venv or node_modules files appear.

**Commit SHA:** ce61aba

### AI-M3-02 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 1, Part 1 — feature/backend-products

**Prompt:** "Part 1: requirements.txt, app/main.py with CORS + {"detail"} error handlers + GET /api/health, tests/test_health.py." Follow-up typed: "check then go".

**AI response summary:** The AI created backend/requirements.txt, backend/pytest.ini (so `pytest` can import `app` from inside backend/), backend/app/__init__.py and backend/app/main.py. main.py creates the FastAPI app, allows CORS only from http://localhost:5173 and http://127.0.0.1:5173, adds GET /api/health, and registers three error handlers so every error is {"detail": "<sentence>"}: HTTP errors keep their message, validation errors are turned into one sentence such as "items.0.quantity: Input should be greater than 0." (the Pydantic "Value error, " prefix is removed), and unexpected errors return 500 with a staff-help message. tests/test_health.py has 6 tests.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: CORS only allows the Vite dev server (port 5173), and every error comes back as {"detail": "..."} so the frontend can always show it. Limitations: the validation handler reports only the first error, and field paths like "items.0.quantity" are technical rather than customer-friendly; the 500 handler hides the real error from the customer (it is still logged in the uvicorn terminal). The test client prints a deprecation warning about httpx with the newest Starlette.

**Changes we made:** None — the code was accepted as generated.

**Verification:** `pytest -v` → 6 passed (health ok, 404 detail, CORS allowed for localhost:5173, CORS refused for other origins, validation message with field name, validation message without the Pydantic prefix). One StarletteDeprecationWarning about httpx in the test client; it does not affect the app. Manual: Swagger GET /api/health → 200 {"status": "ok"}.

**Commit SHA:** 4da145b

### AI-M3-03 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 1, Part 2 — feature/backend-products

**Prompt:** "Part 2: app/database.py (tables, seed, KIOSK_DB), Product schema, GET /api/products, tests using a temporary DB. Explain how to verify in Swagger /docs." Follow-up typed: "next", then "go".

**AI response summary:** The AI created backend/app/database.py (database path from the KIOSK_DB environment variable, default backend/kiosk.db; connect() with rows readable by column name and foreign keys on; get_db() dependency that always closes the connection; init_db() that creates the products, transactions and transaction_items tables and seeds the 6 products only when the table is empty), backend/app/schemas.py with the Product model (price in integer centavos), backend/app/routers/products.py with GET /api/products ordered by id, and a startup hook in main.py that runs init_db(). The change column is named change_due to avoid confusion with SQL keywords; the API will still return it as "change". Tests: conftest.py points KIOSK_DB at a temporary file; test_products.py has 5 tests.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: products are seeded only once, prices are integer centavos, and tests use a temporary database so kiosk.db is never changed. Limitations: because seeding only runs on an empty table, editing SEED_PRODUCTS later does not update an existing kiosk.db (it must be deleted first); there is no API to add or edit products. The transactions tables are created now but are not used until Step 4. One problem during the end-of-step check: `pytest` failed with "No module named 'fastapi'" because the virtual environment was not activated in that terminal — not a code bug; tests pass with .venv active.

**Changes we made:** None — the code was accepted as generated.

**Verification:** `pytest -v` → 11 passed (6 health + 5 products: exact 6 products and prices, integer centavos, seeding twice keeps 6 rows, all 3 tables exist, tests use the temporary database). Live server: GET http://127.0.0.1:8000/api/products returned Coffee 4500 (₱45.00), Sandwich 5000 (₱50.00), Soft Drink 3500 (₱35.00), Cookies 2500 (₱25.00), Bottled Water 2000 (₱20.00), Chocolate 2500 (₱25.00). `git status` does not list kiosk.db (git-ignored).

**Commit SHA:** 3eceaf7

> Note: after the Step 1 push, Kurt asked the AI to run the git commands (add, commit, push) for his own steps to save time. Commits are still authored as Kurt Lumpayao.

### AI-M3-04 — Refactoring — Lumpayao — 2026-10-07
**Step / branch:** Step 1, during review of PR feature/backend-products

**Prompt:** After the AI review reported that SQLite connections fail under concurrent requests, Kurt typed: "dont add database its not required", then chose "In memory (Recommended)" from: in memory / JSON file / keep SQLite. Follow-up typed: "go".

**AI response summary:** The AI removed backend/app/database.py and the startup init_db() hook, added backend/app/store.py with the 6 products hard-coded as a Python list (integer centavos), changed GET /api/products to return that list (same JSON as before), simplified tests/conftest.py (no temporary database) and rewrote tests/test_products.py (exact products, positive integer centavos, unique ids, categories Drinks/Food/Snacks). It updated CLAUDE.md sections 2, 4, 5, 7 and 10: no database, transactions will be kept in memory in Step 4, and references become TXN-YYYYMMDD-HHMMSS-NNN so they never repeat after a server restart. The local kiosk.db was deleted.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the exam says a database is not mandatory, the products response is unchanged, and the thread bug and misleading commit comment from the review are gone because SQLite is gone. Limitation: completed transactions (Step 4) will be lost when the server restarts, so receipts cannot be looked up after a restart; acceptable for one kiosk with no history requirement. The reference format changed from TXN-2026-00001 to TXN-20261007-143015-001.

**Changes we made:** Kurt decided to drop the database (it is not required and is less to explain); he chose in-memory storage over a JSON file.

**Verification:** `pytest -v` → 10 passed (6 health + 4 products). Same 400-concurrent-request test as in the review: before 380 × 500 errors, after 400 × 200 with no errors; no kiosk.db is created.

**Commit SHA:** 12650e4

### AI-M3-05 — Debugging — Lumpayao — 2026-10-07
**Step / branch:** Step 1, fix review on PR feature/backend-products (reviewer: Cheny)

**Prompt:** Cheny's review comment: "backend/app/main.py (unexpected_error_handler): 500 responses have no CORS header, so the browser can't read the detail message and the kiosk shows "Cannot reach the server". Please add Access-Control-Allow-Origin for our allowed origins and a test."

**AI response summary:** Error: a route that raises an exception returned 500 {"detail": "..."} but with no access-control-allow-origin header. Root cause: Starlette sends 500 responses from its outermost error layer, which sits outside CORSMiddleware, so CORS headers are never added to them. Fix: unexpected_error_handler now copies the request's Origin into Access-Control-Allow-Origin (plus Vary: Origin) when it is one of ALLOWED_ORIGINS. Tests: a fixture temporarily adds a route that always crashes; one test checks the 500 detail and CORS header for http://localhost:5173, one checks no header for another origin.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the root cause matches what we saw (header missing only on 500 responses) and the fix is small and only allows our two origins. Limitation: the header is added by hand, so only Access-Control-Allow-Origin is copied — other CORS options (such as credentials) are not; both places do use the same ALLOWED_ORIGINS list.

**Changes we made:** None — accepted as generated.

**Verification:** Before the fix (review experiment): 500 response, access-control-allow-origin = None. After: `pytest` → 12 passed, including test_server_error_returns_detail_with_cors_header and test_server_error_has_no_cors_header_for_other_origins.

**Commit SHA:** e6e2f66

### AI-M3-06 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 1, fix review on PR feature/backend-products (reviewer: Cheny)

**Prompt:** Cheny's review comment: "backend/requirements.txt: please pin the versions we tested with (fastapi==0.142.2, uvicorn[standard]==0.54.0, pydantic==2.13.5, pytest==9.1.1, httpx==0.28.1) so a new release can't break the demo."

**AI response summary:** The AI replaced the open-ended `>=` versions with the exact versions installed in our .venv and used by every test run so far.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: a fresh `pip install` now gets exactly what we tested, so a new release cannot change behaviour before the demo. Limitation: sub-dependencies (e.g. starlette) are not pinned, only the five packages we list; security updates now have to be applied by hand.

**Changes we made:** None — accepted as generated.

**Verification:** `pip install -r requirements.txt` → nothing to change; `pip check` → "No broken requirements found."; `pytest` → 12 passed.

**Commit SHA:** 5cf0711

### AI-M3-07 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 4, Part 1 — feature/backend-transactions

**Prompt:** "Part 1: services/pricing.py + tests/test_pricing.py (175 → 220 → 140; ₱100 on ₱140 rejected with the exact message; ₱200 → ₱60; exact → 0)." Follow-up typed: "go". Kurt asked the AI to create the branch and run the git commands for this step.

**AI response summary:** The AI created backend/app/services/pricing.py with pure functions on integer centavos: format_peso (4500 → "₱45.00", with thousands separators), build_lines (prices every requested item from the server's own product list, rejects unknown products, merges the same product requested twice into one line, and rejects more than 99 of one product — the limit Laiza suggested in the PR #3 review), calculate_total, validate_cash (raises "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00.") and compute_change. tests/test_pricing.py has 16 tests. It also updated CLAUDE.md: Cheny's real username hchenii, setProducts in the frontend contract, and the 99-per-product limit.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the tests use the instructor's exact numbers (₱175 → ₱220 → ₱140, ₱100 on ₱140 rejected with the exact sentence, ₱200 → ₱60, exact → ₱0.00) plus a one-centavo-short edge case. Prices come only from the server's list, so a client cannot send its own price. Limitation: the functions do not check that quantities are at least 1 or that amounts are not negative — that is left to the Pydantic schema in Part 2, so pricing.py must not be called with unvalidated input.

**Changes we made:** None — accepted as generated.

**Verification:** `pytest` → 28 passed (12 existing + 16 new pricing tests).

**Commit SHA:** 59aa5f5

### AI-M3-08 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 4, Part 2 — feature/backend-transactions

**Prompt:** "Part 2: POST /api/transactions per section 4 (Pydantic validation, server-side prices, cash validation, qr/card paid = total, validate everything before saving, save the transaction in memory under a lock, reference from date + time + counter, nothing saved on rejection)." Follow-up typed: "go".

**AI response summary:** The AI added TransactionRequest, OrderItem, Receipt and ReceiptLine to schemas.py (StrictInt so "2", 2.5 or true are rejected instead of converted; quantity 1–99; method cash/qr/card; cash needs an amount_paid of 0 or more; extra fields such as a client "price" are ignored). store.py got PRODUCTS_BY_ID plus an in-memory transactions dict and counter protected by a thread lock. services/transactions.py create_transaction prices the order with pricing.py, validates cash, and only then makes the reference (TXN-YYYYMMDD-HHMMSS-NNN) and saves; QR/card pay exactly the total with ₱0.00 change. routers/transactions.py returns 201, 400 for insufficient cash and 422 for invalid orders. main.py now gives customer-friendly 422 messages for known fields (Cheny's PR #1 suggestion), e.g. "Quantity must be between 1 and 99." conftest.py clears the transactions before every test.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: every acceptance case for payments is covered by tests (₱200 → ₱60, exact → ₱0, QR/card paid = total, ₱100 on ₱140 → 400 with the exact sentence) and every rejected request leaves 0 saved transactions. Client prices are proven to be ignored. Limitations: transactions disappear when the server restarts (team decision: no database); the friendly message map shows only the first error and uses one sentence per field, so a missing "items" and an empty "items" get the same message.

**Changes we made:** None — accepted as generated.

**Verification:** `pytest` → 48 passed (20 new transaction tests). Live server: POST Coffee ×2 + Sandwich, cash 20000 → 201, TXN-20261007-141258-001, total 14000, paid 20000, change 6000, "Cash"; cash 10000 → 400 "Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00."

**Commit SHA:** 5a7b613

### AI-M3-09 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 4, Part 3 — feature/backend-transactions

**Prompt:** "Part 3: GET /api/transactions/{reference} + tests/test_transactions.py for acceptance 4–7 (different references; a rejected payment saves nothing)." Follow-up typed: "next", then "go".

**AI response summary:** The AI added GET /api/transactions/{reference} (200 with the saved receipt, 404 "Transaction not found.") and 7 tests: lookup returns exactly the receipt from the payment, unknown reference → 404, and an end-to-end replay of acceptance 4 (₱100 on ₱140 → 400, no reference, nothing saved), 5 (cash ₱200 → receipt Coffee 2 / Sandwich 1, ₱140 / ₱200 / ₱60 / Cash; exact cash → ₱0), 6 (QR and card receipts: paid = total, change ₱0, correct label) and 7 (two transactions have different references and each lookup returns its own total).

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the acceptance tests now run against the real API, including looking the receipt up again, so the receipt the frontend shows in Step 6 is proven to match the payment. The live check also showed why the reference has a date and time: uvicorn reloaded, the counter restarted at 001, and the reference was still new. Limitation: receipts can only be looked up until the server restarts.

**Changes we made:** None — accepted as generated.

**Verification:** `pytest` → 55 passed. Live server: card payment for 1 Soft Drink → GET TXN-20261007-141430-001 → total 3500, paid 3500, change 0, "Credit/Debit Card".

**Commit SHA:** c28b37d

### AI-M3-10 — Review — Lumpayao — 2026-10-07
**Step / branch:** Review of PR #8 docs/readme (Step 8, author M2 Laiza)

**Prompt:** Review of docs/readme prepared after Laiza typed "done".

**AI response summary:** The AI checked README.md against the repository: setup commands match the real folders, the API table matches CLAUDE.md section 4, test counts (55 backend, 29 frontend), merge commits and reviewers match GitHub, and only Laiza's files changed. One MEDIUM finding: the README said all 7 acceptance tests are automated, but "Back keeps the cart" and "empty cart after New Transaction" are only checked by hand. The sentence was corrected on Laiza's branch before the merge.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the overclaim was real and would have been easy for the instructor to question; every other number in the README was checked against git and GitHub. Limitation: the review checked facts and links, not writing style.

**Changes we made:** Posted: "README is complete and matches the repo: setup commands, API table, 55 + 29 tests, merge commits and reviewers are correct. The one overclaim about automated acceptance tests was fixed. Approved." Merged PR #8 as f28c07f.

**Verification:** PR #8 approved by microxxd300 and merged as f28c07f.

**Commit SHA:** 23f5a44

### AI-M3-11 — Review — Lumpayao — 2026-10-07
**Step / branch:** Step 9 — final check on main (read-only)

**Prompt:** "Run pytest and npm test on the latest main. Trace acceptance 1–7 through the code. Report PASS/FAIL with reasons and the manual demo checklist. Print `git log -1 --format=%H` (the final integration commit SHA). Change nothing." Follow-up typed: "merged".

**AI response summary:** On main f28c07f: `pytest` → 55 passed; `npm ci` + `npm test` → 29 passed; `npm run build` → OK; git status clean (nothing changed). End-to-end browser run against the real backend: 1 ₱90/₱50/₱35 total ₱175 — PASS; 2 Coffee ₱135 total ₱220, back to ₱175 — PASS; 3 Remove Soft Drink ₱140, Summary ₱140, Back keeps Coffee and Sandwich — PASS; 4 Cash ₱100 on ₱140 stays with the exact insufficient message — PASS; 5 Cash ₱200 → receipt ₱140/₱200/₱60/Cash, exact → ₱0.00 — PASS; 6 QR and Card paid ₱140.00, change ₱0.00, correct method — PASS; 7 New Transaction → 0 items, ₱0.00, old reference gone, TXN-…-001 ≠ TXN-…-002 — PASS. Final integration commit: f28c07f3176a627a4e5df0afcb923a89ee292d0d.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the check ran on exactly what is on main, in a real browser with the real backend, not only unit tests. Limitations: optional improvements were not done because of the 9 pm deadline (99-per-product toast on the kiosk, keypad limit toast, receipt fallback after a backend restart; backend message for a malformed item and no maximum cash amount).

**Changes we made:** None to the app — Step 9 is read-only; this log entry is added in a separate small PR.

**Verification:** Results above; final SHA f28c07f3176a627a4e5df0afcb923a89ee292d0d.

**Commit SHA:** 23f5a44

### AI-M3-12 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Extra after Step 9 — feature/deploy-cors

**Prompt:** "now i need to deploy this on vercel guide me"

**AI response summary:** The AI explained that the backend keeps transactions in memory, so Vercel's short-lived Python functions could save a payment in one instance and look up the receipt in another ("Transaction not found."). It recommended the frontend on Vercel and the backend on Render (one long-running process). To let the deployed frontend call the API, main.py now builds the CORS list from the two local Vite addresses plus any URLs in the environment variable KIOSK_ALLOWED_ORIGINS (comma-separated, trailing "/" removed). 2 tests added.

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: no deployed URL is hard-coded, local development is unchanged, and the in-memory limitation was explained before choosing a host. Limitation: Render's free plan sleeps after inactivity, so the first request can take up to about a minute and in-memory receipts are lost when it sleeps.

**Changes we made:** None — accepted as generated.

**Verification:** `pytest` → 57 passed (2 new: only local origins by default; extra origins read from KIOSK_ALLOWED_ORIGINS).

**Commit SHA:** 0208f05

### AI-M3-13 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Extra after Step 9 — feature/vercel-backend

**Prompt:** "can i deploy both on vercel i have tried it before i deployed django serverless"

**AI response summary:** The AI confirmed both parts can run on Vercel as two projects (root frontend and root backend) and added backend/api/index.py (Vercel's Python entry point; it adds the backend folder to the import path and exposes the FastAPI app) and backend/vercel.json (sends every path to that function, so /api/health, /api/products and /api/transactions keep working). It warned that serverless instances do not share memory, so a receipt lookup can miss a payment saved by another instance; the frontend Receipt therefore needs a fallback to the receipt it already received (a separate change in Laiza's Receipt.jsx).

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the existing app is reused unchanged, and the entry file was tested locally (health ok, 6 products). Limitation: in-memory transactions on serverless are not reliable across instances — acceptable for a demo only together with the frontend fallback.

**Changes we made:** None — accepted as generated.

**Verification:** Loading api/index.py and calling it with TestClient → /api/health {"status": "ok"}, /api/products 6 products; `pytest` → 57 passed.

**Commit SHA:** fill in after committing
