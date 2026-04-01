# Platita — AI Build Plan

Este documento define el plan de construcción del proyecto Platita utilizando un agente de AI (Codex, Cursor, Copilot Chat, etc.) de forma ordenada y sin generar caos en el código.

El proyecto debe construirse **por etapas**, nunca todo junto.

Regla principal:
> Nunca pedirle al agente que construya toda la app.  
> Siempre trabajar por pasos controlados.

---

# Reglas generales para el agente AI

Antes de cada paso, enviar este mensaje al agente:
Before making changes, inspect the current codebase and preserve the existing architecture.
Only implement the scope of this step.
Do not refactor unrelated files unless strictly necessary.
If something from a previous step is inconsistent, fix it with the smallest possible change.
Prefer simple and explicit code over complex abstractions.

---


Después de cada paso, pedirle:
At the end:

summarize what you changed
list created/updated files
mention any assumptions
mention anything intentionally left for the next step

---

# Orden de construcción del proyecto

El proyecto debe construirse en este orden exacto:

1. Base del proyecto + estructura
2. SQLite setup
3. Tablas + índices + seeds
4. Repositories
5. Zustand stores
6. Navigation
7. Accounts feature
8. Transactions feature
9. Dashboard
10. Budgets
11. Salary + Economic Data

---

# STEP 1 — Project Base & Structure

Objetivo:
- Crear proyecto Expo + TypeScript
- Crear estructura de carpetas
- Configurar Expo Router
- App compilando

Prompt:

You are a senior React Native engineer.

Create the initial codebase for a mobile app called "Platita" using:
- React Native
- TypeScript
- Expo
- Expo Router

Create the following structure:

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

Do not implement business logic yet.
Ensure the app compiles.

---

# STEP 2 — SQLite Setup

Objetivo:
- Configurar expo-sqlite
- Inicialización de DB
- Provider de DB
- Migraciones base

Implement SQLite setup inside:
- src/database/client/
- src/database/schema/

Database must initialize on app startup.

Do not create full tables yet unless part of migration setup.

---

# STEP 3 — Tables, Indexes, Seeds

Objetivo:
- Crear tablas
- Crear índices
- Seed categorías iniciales

Tablas:
- accounts
- categories
- transactions
- monthly_budgets
- economic_data

Reglas:
- Money stored as INTEGER cents
- Dates ISO string
- Inflation basis points
- Dollar integer cents

Insert default categories:
Income:
- Sueldo
- Ingreso extra

Expense:
- Comida
- Transporte
- Alquiler
- Servicios
- Salud
- Ocio
- Educación
- Impuestos

Yield:
- Rendimientos

---

# STEP 4 — Repositories

Objetivo:
- Crear capa de acceso a datos

Crear:
- account.repository.ts
- category.repository.ts
- transaction.repository.ts
- budget.repository.ts
- economicData.repository.ts

Repositories only handle SQL.
No business logic here.

---

# STEP 5 — Zustand Stores

Objetivo:
- Estado global UI

Stores:
- app.store
- filters.store
- ui.store

app.store:
- selectedMonth
- selectedYear
- appLoaded

filters.store:
- transactionFilters

ui.store:
- loading
- modals
- snackbar

SQLite sigue siendo la fuente de verdad.

---

# STEP 6 — Navigation

Objetivo:
- Bottom Tabs navigation

Tabs:
- Inicio
- Movimientos
- Nuevo movimiento
- Presupuestos
- Ajustes

Crear pantallas placeholder:
- Home
- Movements
- New Movement
- Budgets
- Settings

Rutas adicionales:
- accounts/new
- accounts/[id]
- categories/new
- categories/[id]
- economic-data
- backup

---

# STEP 7 — Accounts Feature

Objetivo:
- CRUD cuentas

Funcionalidades:
- crear cuenta
- editar cuenta
- listar cuentas
- saldo inicial
- validaciones
- formularios con React Hook Form + Zod

Tipos de cuenta:
- cash
- bank
- wallet
- investment

---

# STEP 8 — Transactions Feature

Objetivo:
- Movimientos

Tipos:
- income
- expense
- transfer
- yield

Formulario Nuevo Movimiento:
- type
- amount
- category
- account
- date
- note
- from/to account for transfer

Pantalla Movimientos:
- listado
- filtros básicos

Reglas:
- transfer no cuenta como ingreso/gasto
- yield cuenta como rendimiento
- income/expense requieren categoría
- transfer requiere cuenta origen y destino

---

# STEP 9 — Dashboard

Objetivo:
- Pantalla Inicio funcional

Mostrar:
- dinero total
- saldo por cuenta
- resumen mensual:
  - ingresos
  - gastos
  - rendimientos
  - balance

Fórmulas:

current_balance =
  initial_balance
  + income
  + yield
  - expense
  + transfer_in
  - transfer_out

monthly_balance =
  income + yield - expense

---

# STEP 10 — Budgets

Objetivo:
- Presupuesto mensual por categoría

Reglas:
- Solo categorías de gasto
- Un presupuesto por categoría por mes
- Status:
  - normal < 80%
  - warning 80-100%
  - exceeded > 100%

Mostrar:
- presupuesto
- gastado
- restante
- estado

---

# STEP 11 — Salary + Economic Data

Objetivo:
- Análisis salarial

Economic Data:
- dólar oficial mensual
- inflación mensual

Salary:
- sueldo detectado por categoría "Sueldo"
- sueldo en USD
- variación nominal
- variación real vs inflación

Fórmulas:

salary_usd = salary_ars / dollar_official

real_variation = salary_variation - inflation_variation

---

# Reglas de arquitectura importantes

Siempre mantener:

Arquitectura:

Screen
 → Feature Hook
 → Service
 → Repository
 → SQLite

Zustand solo para UI state.

Nunca:
- SQL en componentes
- lógica financiera en UI
- Redux
- backend
- cloud sync
- overengineering

---

# Roadmap visual del proyecto

Orden real de construcción:

1. Project setup
2. Database
3. Tables
4. Repositories
5. Stores
6. Navigation
7. Accounts
8. Transactions
9. Dashboard
10. Budgets
11. Salary
12. Backup (futuro)
13. Charts (futuro)
14. Export/Import (futuro)

---

# Objetivo final del MVP

El MVP debe permitir:

- Crear cuentas con saldo inicial
- Registrar ingresos
- Registrar gastos
- Registrar transferencias
- Registrar rendimientos
- Ver dinero total
- Ver resumen mensual
- Configurar presupuestos
- Cargar dólar mensual
- Cargar inflación mensual
- Analizar sueldo en USD
- Analizar sueldo real
- Funcionar offline
- Persistir datos localmente