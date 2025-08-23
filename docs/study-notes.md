# Study Notes - Anti-Flex Project

## Day 1: Frontend Setup & Mock Data

### What I Did

- Initialized React app with Vite (React 18, React Router v6).
- Configured routing with three pages: `Home`, `About`, `Expenses`.
- Built `Expenses` page with:
  - A table to display expenses.
  - A form to **add new expenses**.
  - **Edit and Delete buttons**.
- All data is stored in React state (mock data, not yet connected to backend).

### What I Learned

- How to scaffold a React project using Vite.
- Managing component state with `useState`.
- Building controlled forms (inputs tied directly to state).
- Importance of structured commit messages for clarity (`feat:`, `fix:`, etc.).

### Struggles & Fixes

- Initially had issues running the app because **Vite requires Node.js 20+**, but my system was on Node.js 18.  
  → Solved this by installing **nvm for Windows** and switching to Node.js 20.
- Faced an “Invalid Hook Call” error in React Router due to **duplicate React versions** in dependencies.  
  → Fixed by cleaning `node_modules` and `package-lock.json`, then reinstalling dependencies with the correct versions.
- Learned the importance of checking React + React DOM versions with `npm list` to ensure compatibility.

### Next Step

- Set up backend API with Node.js + Express.
- Connect frontend form to backend using `fetch` or `axios`.
- Later: Persist expenses in a real database.
- Continue improving layout and styling once backbone is complete.

---

## Day 2: Backend + CRUD Integration

### What I Did

**Backend (Express API):**

- Built server with routes:
  - `GET /expenses` → fetch expenses
  - `POST /expenses` → add expense
  - `PUT /expenses/:id` → update expense
  - `DELETE /expenses/:id` → delete expense
- Added middleware: `cors`, `express.json()`.
- Fixed bug (`port` → `PORT`).
- Server runs at http://localhost:5001.

**Frontend (React + Axios):**

- Updated `ExpensesPage.jsx` to:
  - Load expenses from backend API.
  - Fall back to mock data if API fails.
  - Support Add, Edit, Delete with live sync to backend.
  - Reset form after actions.
  - Fixed date handling (`expense.date.split("T")[0]`).

**Integration:**

- Fixed 500 error → caused by missing `.env` config for `VITE_API_URL`.
- Confirmed frontend ↔ backend communication works correctly.

### What I Learned

- Express basics: routes, middleware, environment variables.
- React hooks in practice:
  - `useState` for form + table state.
  - `useEffect` for fetching API data.
- Using Axios for all CRUD operations.
- `.env` in Vite:
  - Variables must start with `VITE_`.
  - Accessed via `import.meta.env`.
- Debugging flow:
  - Port mismatch (`port` vs `PORT`).
  - Missing `.env` → API errors.

### Progress

- First end-to-end expense tracker (frontend + backend).
- Practiced error handling with graceful fallback.
- Learned to trace API errors and fix config issues.


