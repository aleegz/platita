Continue the existing "Platita" project.

Now implement the Dashboard feature.

The Home screen must show:
1. Total money available across all active accounts
2. Account balances snapshot
3. Monthly summary:
   - ingresos
   - gastos
   - balance
   - rendimientos
4. A simple section for top expense categories if feasible
5. Clean Spanish UI

Business rules:
- total money = sum of current balances of all active accounts
- current account balance =
  initial_balance
  + income
  + yield
  - expense
  + transfer_in
  - transfer_out
- monthly balance = income + yield - expense
- transfer does not affect monthly balance as income/expense

Implement:
- dashboard services
- balance calculation services
- hooks for dashboard
- Home screen rendering real data
- reusable summary cards/components if useful

Important:
- Put calculations in services/lib, not directly in components
- Keep the Home screen simple and clean
- No heavy chart work yet unless very small/simple

Expected output:
- home dashboard showing real data from SQLite
- account balances displayed
- monthly summary displayed