Continue the existing "Platita" project.

Now implement the Budgets feature.

Business rules:
- Monthly budget per expense category
- Only expense categories can have budgets
- One budget per category per month/year
- Budget usage = expense total for category / budget amount
- Status:
  - normal: < 80%
  - warning: 80% to 100%
  - exceeded: > 100%

Implement:
1. Budget services
2. Budget hooks
3. Budgets screen
4. Ability to create/update monthly budget for a category
5. Budget usage display
6. Status display in Spanish

UI requirements:
- Show list of expense categories
- Show configured budget
- Show spent amount in current month
- Show remaining amount
- Show usage status

Keep it simple and readable.
Do not overdesign charts.
Use SQLite as source of truth.

Expected output:
- budgets feature working
- monthly category budget editing working
- status calculation working