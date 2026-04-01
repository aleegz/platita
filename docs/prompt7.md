Continue the existing "Platita" project.

Now implement the Accounts feature end-to-end for the MVP.

Business context:
Accounts represent where the user's money is stored.
Examples:
- Mercado Pago
- Santander
- Efectivo
- Naranja X

Rules:
- Each account has an initial balance
- Initial balance is stored in cents
- Account types:
  - cash
  - bank
  - wallet
  - investment
- UI text must be in Spanish
- Technical code must be in English

Implement:
1. Account feature types
2. Account feature hooks
3. Account services
4. New Account screen
5. Edit Account screen
6. Accounts list section inside Settings
7. Form validation using React Hook Form + Zod

Create or update:
- `src/features/accounts/...`
- `src/app/accounts/new.tsx`
- `src/app/accounts/[id].tsx`
- Accounts section entry from Settings screen

Required functionality:
- create account
- edit account
- list active accounts
- validate required fields
- name required
- initial_balance >= 0

Do not calculate derived current balance yet unless needed minimally.
Do not implement transfers or transactions here.
Expected output:
- accounts CRUD working
- forms working
- data persisted in SQLite
- navigation connected