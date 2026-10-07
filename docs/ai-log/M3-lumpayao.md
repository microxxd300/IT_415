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

**Evaluation:** (Drafted with AI help at Kurt's request.) Correct: the root cause matches what we saw (header missing only on 500 responses) and the fix is small and only allows our two origins. Limitation: the header is added by hand, so if ALLOWED_ORIGINS changes, both CORS places still use the same list (good), but other CORS options such as credentials are not copied.

**Changes we made:** None — accepted as generated.

**Verification:** Before the fix (review experiment): 500 response, access-control-allow-origin = None. After: `pytest` → 12 passed, including test_server_error_returns_detail_with_cors_header and test_server_error_has_no_cors_header_for_other_origins.

**Commit SHA:** fill in after committing
