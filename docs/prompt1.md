You are a senior React Native engineer.

Create the initial codebase for a mobile app called "Platita" using:

- React Native
- TypeScript
- Expo
- Expo Router

General rules:
- All technical code must be in English
- All UI text must be in Spanish
- Use a clean, scalable MVP architecture
- Do not add backend
- Do not add authentication
- Do not add cloud sync
- Do not add Redux
- Do not overengineer

Project goal:
Platita is a local-first personal finance app for Argentina, focused on:
- accounts
- transactions
- budgets
- salary analysis
- economic data
- dashboard

Create the initial folder structure under `src/`:

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

Tasks:
1. Initialize the project structure
2. Configure Expo Router correctly
3. Create a minimal root layout
4. Create placeholder files where needed
5. Add a clean README with setup instructions
6. Keep the app compiling successfully

Do not implement business logic yet.
Do not create database tables yet.
Do not create screens beyond placeholders if needed.

Expected output:
- working Expo + TypeScript base
- folder structure created
- root app layout configured
- minimal README