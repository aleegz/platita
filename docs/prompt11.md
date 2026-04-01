Continue the existing "Platita" project.

Now implement the salary analysis and economic data features.

Business context:
The app is Argentina-focused.
Salary analysis is one of the key differentiators.

Salary detection rule:
- Monthly salary is identified from income transactions whose category is "Sueldo"

Economic data:
- one row per month/year
- official dollar
- monthly inflation

Required features:

A. Economic Data
Implement screens/services/hooks to:
- create or update monthly official dollar
- create or update monthly inflation
- list existing periods if helpful

B. Salary Analysis
Implement services/hooks to calculate:
- salary in ARS for selected month
- salary in USD using official dollar
- nominal salary variation vs previous month
- real salary variation vs inflation (simple MVP version)

Important business rules:
- salary in USD = salary_ars / dollar_official
- use only the "Sueldo" category for salary analysis
- do not mix salary with other income categories
- keep real salary variation formula simple and explicit
- if previous month data is missing, handle gracefully
- if economic data is missing, show informative Spanish empty state

UI requirements:
- Add salary section into Home screen or a dedicated area reachable from it
- Add Economic Data management under Settings / Economic Data
- All user-facing text in Spanish

Do not add scraping.
Do not add automation.
Do not add cloud sync.

Expected output:
- economic data CRUD working
- salary analysis working
- salary section visible in app
- clear empty states when data is missing