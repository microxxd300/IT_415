# AI Development Log — M3 Kurt Lumpayao

### AI-M3-01 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 0, Part 1 — main (first commit, repository setup)

**Prompt:** "Part 1: in C:\Projects\IT_415_backend create CLAUDE.md containing sections 0–11 of this message verbatim (so any new session has full context); .claude/settings.json = {"attribution": {"commit": "", "pr": "", "sessionUrl": false}}; .gitignore (Python: .venv, __pycache__, *.db, .pytest_cache; Node: node_modules, dist; editor files); README.md (title + "In progress"); docs/ai-log/M1-cheny.md, M2-laiza.md, M3-lumpayao.md (a heading each). Do not create backend/ or frontend/." Follow-up typed: "go".

**AI response summary:** The AI created CLAUDE.md with sections 0–11 of the master prompt, .claude/settings.json turning off AI attribution in commits and PRs, a .gitignore for Python, Node, editor and OS files (it also ignores .env files and .claude/settings.local.json), a placeholder README.md, and one AI log file per member. It did not create backend/ or frontend/ and did not run any git write commands.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `git status` lists exactly 7 new files (CLAUDE.md, .claude/settings.json, .gitignore, README.md, docs/ai-log/M1-cheny.md, M2-laiza.md, M3-lumpayao.md); no .db, .venv or node_modules files appear.

**Commit SHA:** ce61aba

### AI-M3-02 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 1, Part 1 — feature/backend-products

**Prompt:** "Part 1: requirements.txt, app/main.py with CORS + {"detail"} error handlers + GET /api/health, tests/test_health.py." Follow-up typed: "check then go".

**AI response summary:** The AI created backend/requirements.txt, backend/pytest.ini (so `pytest` can import `app` from inside backend/), backend/app/__init__.py and backend/app/main.py. main.py creates the FastAPI app, allows CORS only from http://localhost:5173 and http://127.0.0.1:5173, adds GET /api/health, and registers three error handlers so every error is {"detail": "<sentence>"}: HTTP errors keep their message, validation errors are turned into one sentence such as "items.0.quantity: Input should be greater than 0." (the Pydantic "Value error, " prefix is removed), and unexpected errors return 500 with a staff-help message. tests/test_health.py has 6 tests.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `pytest -v` → 6 passed (health ok, 404 detail, CORS allowed for localhost:5173, CORS refused for other origins, validation message with field name, validation message without the Pydantic prefix). One StarletteDeprecationWarning about httpx in the test client; it does not affect the app.

**Commit SHA:** 4da145b

### AI-M3-03 — Generation — Lumpayao — 2026-10-07
**Step / branch:** Step 1, Part 2 — feature/backend-products

**Prompt:** "Part 2: app/database.py (tables, seed, KIOSK_DB), Product schema, GET /api/products, tests using a temporary DB. Explain how to verify in Swagger /docs." Follow-up typed: "next", then "go".

**AI response summary:** The AI created backend/app/database.py (database path from the KIOSK_DB environment variable, default backend/kiosk.db; connect() with rows readable by column name and foreign keys on; get_db() dependency that always closes the connection; init_db() that creates the products, transactions and transaction_items tables and seeds the 6 products only when the table is empty), backend/app/schemas.py with the Product model (price in integer centavos), backend/app/routers/products.py with GET /api/products ordered by id, and a startup hook in main.py that runs init_db(). The change column is named change_due to avoid confusion with SQL keywords; the API will still return it as "change". Tests: conftest.py points KIOSK_DB at a temporary file; test_products.py has 5 tests.

**Evaluation:** TODO

**Changes we made:** TODO

**Verification:** `pytest -v` → 11 passed (6 health + 5 products: exact 6 products and prices, integer centavos, seeding twice keeps 6 rows, all 3 tables exist, tests use the temporary database). Live server: GET http://127.0.0.1:8000/api/products returned Coffee 4500 (₱45.00), Sandwich 5000 (₱50.00), Soft Drink 3500 (₱35.00), Cookies 2500 (₱25.00), Bottled Water 2000 (₱20.00), Chocolate 2500 (₱25.00). `git status` does not list kiosk.db (git-ignored).

**Commit SHA:** 3eceaf7
