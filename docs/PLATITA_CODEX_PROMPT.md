You are a senior mobile software engineer and system architect.

Your task is to generate the base architecture and initial implementation of a mobile application called "Platita".

This is a personal finance app focused on Argentina, built as a local-first application.

IMPORTANT:
You must follow the architecture, data model, and rules described below.
Do NOT invent a different architecture.
Do NOT overengineer.
Do NOT add backend.
Do NOT add authentication.
Do NOT add cloud sync.
Do NOT use Redux.
Use Zustand.
Use SQLite as the source of truth.
All code must be in English.
All UI text must be in Spanish.

-------------------------------------
PROJECT OVERVIEW
-------------------------------------

Platita is a personal finance mobile application that allows users to:

- Manage multiple accounts
- Register income, expenses, transfers, and yields
- Track monthly budgets by category
- View total money across accounts
- Analyze monthly financial balance
- Track salary evolution in ARS, USD, and real value vs inflation
- Store economic data like official dollar and monthly inflation
- Work fully offline with local SQLite database

The app is Argentina-focused.

-------------------------------------
TECH STACK
-------------------------------------

Use the following stack:

- React Native
- TypeScript
- Expo
- Expo Router
- SQLite (expo-sqlite)
- Zustand
- React Hook Form
- Zod
- date-fns
- UUID
- Chart library (simple)
- No Redux
- No backend
- No cloud

-------------------------------------
ARCHITECTURE RULES
-------------------------------------

The project must follow a modular feature-based architecture.

Layers:

1. UI Layer (screens and components)
2. Feature Layer (hooks, services, feature components)
3. Domain / Business Logic (financial calculations)
4. Data Layer (SQLite repositories)
5. State Layer (Zustand for UI state only)
6. Shared Lib (helpers, constants, money calculations)
7. Theme
8. Content (Spanish UI strings)

SQLite is the single source of truth.
Zustand is only for UI state, filters, and selected month/year.

UI must NOT run SQL directly.
Financial calculations must NOT be inside React components.

-------------------------------------
FOLDER STRUCTURE
-------------------------------------

Create the following project structure:

src/
  app/
  components/
  features/
    accounts/
    transactions/
    budgets/
    dashboard/
    salary/
    economicData/
    settings/
  database/
    client/
    schema/
    repositories/
    seeds/
  store/
  lib/
  theme/
  content/
  types/

-------------------------------------
DATABASE SCHEMA
-------------------------------------

Tables:

accounts
categories
transactions
monthly_budgets
economic_data

Transactions types:
- income
- expense
- transfer
- yield

Money must be stored as INTEGER in cents.
Dates stored as ISO string.
Inflation stored as basis points.
Dollar stored as cents.

Balance formula:
current_balance =
  initial_balance
  + income
  + yield
  - expense
  + transfer_in
  - transfer_out

Monthly balance:
monthly_balance = income + yield - expense

-------------------------------------
FEATURES
-------------------------------------

Implement the following modules:

Accounts
- create account
- edit account
- list accounts
- calculate account balance

Transactions
- create income
- create expense
- create transfer
- create yield
- list transactions
- filter transactions

Budgets
- monthly budget per category
- budget usage calculation
- budget status (normal, warning, exceeded)

Dashboard
- total money
- accounts snapshot
- monthly summary
- top expenses
- budget overview

Salary
- monthly salary detection (category = salary)
- salary in USD
- salary variation
- real salary vs inflation

Economic Data
- monthly dollar
- monthly inflation

Settings
- accounts
- categories
- economic data
- backup

-------------------------------------
NAVIGATION
-------------------------------------

Use Expo Router with Bottom Tabs:

Tabs:
- Home
- Movements
- New Movement
- Budgets
- Settings

Additional screens:
- New Account
- Edit Account
- New Category
- Edit Category
- Economic Data
- Backup

-------------------------------------
ZUSTAND STORES
-------------------------------------

Create stores:

app.store
- selectedMonth
- selectedYear
- appLoaded

filters.store
- transactionFilters

ui.store
- modal states
- loading
- snackbar

-------------------------------------
REPOSITORIES
-------------------------------------

Create repositories:

account.repository.ts
category.repository.ts
transaction.repository.ts
budget.repository.ts
economicData.repository.ts

Repositories handle SQL only.

-------------------------------------
SERVICES / BUSINESS LOGIC
-------------------------------------

Create services for:

- getAccountBalance
- getTotalMoney
- getMonthlyBalance
- getBudgetUsage
- getDashboardSummary
- getSalaryUSD
- getSalaryVariation
- getRealSalary

These must be pure logic or repository-based logic.

-------------------------------------
INITIAL TASKS FOR YOU (AI AGENT)
-------------------------------------

Step 1:
Initialize Expo + TypeScript project structure.

Step 2:
Create folder structure described above.

Step 3:
Implement SQLite database initialization and migrations.

Step 4:
Create tables:
accounts
categories
transactions
monthly_budgets
economic_data

Step 5:
Insert default categories seed.

Step 6:
Create repositories.

Step 7:
Create basic Zustand stores.

Step 8:
Create Bottom Tab navigation.

Step 9:
Create empty screens:
Home
Movements
New Movement
Budgets
Settings

Step 10:
Implement Accounts CRUD.

Do NOT implement everything at once.
Build step by step.

-------------------------------------
IMPORTANT RULES
-------------------------------------

Do NOT:
- Add backend
- Add authentication
- Add Redux
- Add cloud sync
- Add unnecessary libraries
- Overengineer architecture
- Create overly complex abstractions
- Add features not listed

Focus on a clean, scalable MVP architecture.

-------------------------------------
OUTPUT EXPECTED
-------------------------------------

You must generate:

1. Project structure
2. Database initialization
3. Tables SQL
4. Repositories
5. Zustand stores
6. Navigation
7. Basic screens
8. Accounts feature
9. Basic dashboard summary logic
10. README with setup instructions

Code must be clean, typed, and modular.