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
