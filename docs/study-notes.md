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

---

## Day 3: DynamoDB Integration & Full CRUD

### What I Did

- Connected backend API to **AWS DynamoDB** (NoSQL database).
- Replaced mock data fallback in frontend — all expenses now come from DynamoDB.
- Created backend CRUD routes with `@aws-sdk/lib-dynamodb`:
  - `GET /expenses` → fetch all expenses from DynamoDB.
  - `POST /expenses` → add new expense (using `randomUUID` for unique IDs).
  - `PUT /expenses/:expenseId` → update an existing expense.
  - `DELETE /expenses/:expenseId` → delete expense by ID.
- Cleaned up DynamoDB table:
  - Standardized **primary key** → `expenseId`.
  - Ensured `amount` is stored as a **Number**, not a string.
- Verified full flow: **frontend ↔ backend ↔ DynamoDB**.

### What I Learned

- DynamoDB basics: tables, partition keys, and data types.
- How NoSQL differs from SQL (schema-less but still needs consistent keys).
- Using `ScanCommand`, `PutCommand`, `UpdateCommand`, and `DeleteCommand` in DynamoDB.
- How to structure `UpdateExpression` and `ExpressionAttributeValues` to safely update items.
- Importance of consistent IDs — switched from timestamp IDs → `UUIDs`.

### Struggles & Fixes

- **Struggle**: Had no prior NoSQL experience, so DynamoDB setup felt confusing.  
  → Fixed by carefully checking how DynamoDB stores attributes (`S` for string, `N` for number).
- **Issue**: Frontend mock data vs backend schema mismatch.  
  → Solved by cleaning data and aligning all fields (`title`, `amount`, `date`, `expenseId`).
- **Problem**: Some old items in DynamoDB were missing `expenseId`.  
  → Used a script to fix records and reinsert correctly.

### Next Step

- Add **authentication** (user-specific expenses).
- Improve frontend UI (filters, totals, categories).
- Deploy backend + DynamoDB setup (instead of local-only).

---

## Day 4: Authentication (Cognito) + Securing Expenses

### What I Did

- Integrated **AWS Cognito** for authentication (login/logout flow).
- Configured backend middleware to validate **JWT access tokens** from Cognito.
- Updated frontend:
  - Login page exchanges credentials → receives `access_token`.
  - Stored token in `localStorage`.
  - `ExpensesPage` fetches expenses with `Authorization: Bearer <token>`.
  - Added Logout button to clear token + redirect to login.
- Verified full flow:
  - Logged in → token stored → expenses visible.
  - Logged out → redirected to login.
  - Invalid/expired token → 401 response + auto logout.

### What I Learned

- Difference between **ID token** and **Access token**:
  - ID token → user profile info.
  - Access token → actual resource access (for API).
- How to secure Express routes with Cognito JWT validation.
- Using React Router’s `ProtectedRoute` pattern to guard pages.
- How frontend state (Login vs Logout in navbar) depends on `localStorage`.

### Struggles & Fixes

- **Issue**: Used `id_token` instead of `access_token` → always got `401 Unauthorized`.  
  → Fixed by switching to `access_token` for API requests.
- **Problem**: `.env` file not loading in backend → `Region` and `Pool ID` were undefined.  
  → Solved by installing/configuring `dotenv` properly and loading values at server startup.
- **Error**: `useNavigate()` hook crashed because it was used outside a Router.  
  → Fixed by restructuring `Logout` button logic so it only runs inside `<BrowserRouter>`.
- **UI Bug**: Navbar always showed “Login” even after logging in.  
  → Fixed by conditionally checking `localStorage` for token and updating text to “Logout”.
- **Styling mismatch**: Login vs Logout links looked inconsistent.  
  → Fixed with shared Tailwind classes for uniform appearance.

### Next Step

- **Day 5 focus** → UI polish:
  - Improve navbar styling (consistent text weight, alignment, hover states).
  - Enhance expenses table (striped rows, better buttons, mobile-friendly).
  - Add layout spacing and responsive design.

---

## Day 5: Deployment Prep (Lambda + API Gateway + IAM)

### What I Did

- Prepared backend for deployment on **AWS Lambda**:
  - Installed and configured `serverless-http` wrapper around Express.
  - Added conditional local server (runs only outside Lambda).
- Created **Lambda function** in AWS Console and uploaded backend ZIP.
- Integrated with **API Gateway**:
  - Tested API routes (`/expenses`) from Postman.
  - Identified and fixed issues with handler config and API Gateway stage paths.
- Fixed **IAM role permissions**:
  - Updated Lambda execution role with a new inline policy that allows DynamoDB actions (`Query`, `PutItem`, `UpdateItem`, `DeleteItem`) on the `ExpensesTable`.
  - Verified by testing DynamoDB access through Lambda logs.
- Confirmed **JWT authentication middleware** still works inside Lambda.
- Cleaned backend repo to a stable, deployment-ready state:
  - `.env`, `server.js`, `lambda.js`, `authMiddleware.js`, and `package.json` all aligned for production.

### What I Learned

- How Lambda differs from a traditional Express server — Express must be wrapped with `serverless-http`.
- Importance of **API Gateway stage URLs** (default adds `/default/` in path).
- Debugging flow for Lambda:
  - **500 Internal Server Error** → check handler path & runtime logs.
  - **AccessDeniedException** → fix IAM role with explicit DynamoDB permissions.
- Clean separation between **local dev** (runs on port 5001) and **deployed Lambda** (through API Gateway).

### Struggles & Fixes

- **Issue**: First Lambda test returned `Cannot GET /default/expenses`.  
  → Fixed by aligning `server.handler` export with Lambda entry.
- **Problem**: Missing permissions → `AccessDeniedException` from DynamoDB.  
  → Solved by updating IAM execution role policy with correct DynamoDB actions.
- **Error**: Got empty array responses.  
  → Discovered test user (`test-user`) had no data; confirmed DynamoDB integration is working by inserting test data.
- **Confusion**: Access token handling in Postman.  
  → Skipped for now; will return when wiring real frontend auth.

### Next Step

- **Day 6 focus** → Frontend + backend integration in deployed environment:
  - Update frontend to call **API Gateway endpoint** instead of local server.
  - Implement Cognito login flow to fetch **access token** automatically.
  - Verify end-to-end: login → token → expenses saved in DynamoDB (per user).

---

## Day 6: End-to-End Deployment Testing

### What I Did

- Updated **frontend API base URL** to point to **API Gateway endpoint** instead of local backend.
- Verified requests now reach deployed Lambda → DynamoDB.
- Added debugging logs in Lambda to confirm user IDs are passed through JWT.
- Inserted test data in DynamoDB with real `userId` from token for validation.
- Ensured `.env` values are aligned across local dev and Lambda runtime:
  - `COGNITO_REGION`
  - `COGNITO_USER_POOL_ID`
  - `EXPENSES_TABLE`
- Cleaned backend code for deployment consistency:
  - `lambda.js` properly exports handler.
  - `authMiddleware.js` validates access tokens reliably.
  - `server.js` runs both locally and in Lambda without conflict.

### What I Learned

- Importance of aligning **frontend API URL** with deployed environment.
- How JWT `sub` field (user ID) ties expenses to a specific user.
- DynamoDB returns empty results if `userId` mismatch occurs → reinforced value of consistent token testing.
- Debugging Lambda requires careful log inspection since API Gateway only returns generic error messages.

### Struggles & Fixes

- **Problem**: Initially got `No authorization header`.  
  → Fixed by sending `Authorization: Bearer <access_token>` in requests.
- **Issue**: DynamoDB query returned blank arrays.  
  → Solved by ensuring test data had matching `userId` (from Cognito `sub`).
- **Error**: Postman tests failed without valid access token.  
  → Skipped manual token generation for now, will automate in frontend login flow.


### Final note ###

- The application is fully hosted and running.
- Auto deployment is completely set up, so the application can be updated via Github commits.
- Additional features can be added later.