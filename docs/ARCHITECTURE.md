# Platita — Arquitectura del Proyecto React Native

## 1. Visión general de arquitectura

Platita es una aplicación móvil **local-first** construida con:

- React Native
- TypeScript
- Expo
- Expo Router
- SQLite
- Zustand
- React Hook Form
- Zod

La aplicación sigue una arquitectura modular basada en **features**, donde la lógica de negocio, acceso a datos y UI están separadas.

---

# 2. Principios de arquitectura

La arquitectura del proyecto se basa en los siguientes principios:

1. **Local-first**  
   SQLite es la fuente de verdad de los datos.

2. **Separación de responsabilidades**  
   UI, lógica de negocio y acceso a datos están separados.

3. **Arquitectura por features**  
   El proyecto se organiza por módulos funcionales.

4. **Servicios para lógica financiera**  
   Los cálculos financieros no deben estar en componentes UI.

5. **Estado global mínimo**  
   Zustand se usa solo para estado de UI y filtros.

6. **Código técnico en inglés, UI en español**

---

# 3. Stack tecnológico

## Core
- React Native
- TypeScript
- Expo
- Expo Router

## Persistencia
- SQLite (expo-sqlite)

## Estado
- Zustand

## Formularios
- React Hook Form
- Zod

## Utilidades
- date-fns
- uuid

## Gráficos
- Victory Native / similar

---

# 4. Estructura de carpetas
# Platita — Arquitectura del Proyecto React Native

## 1. Visión general de arquitectura

Platita es una aplicación móvil **local-first** construida con:

- React Native
- TypeScript
- Expo
- Expo Router
- SQLite
- Zustand
- React Hook Form
- Zod

La aplicación sigue una arquitectura modular basada en **features**, donde la lógica de negocio, acceso a datos y UI están separadas.

---

# 2. Principios de arquitectura

La arquitectura del proyecto se basa en los siguientes principios:

1. **Local-first**  
   SQLite es la fuente de verdad de los datos.

2. **Separación de responsabilidades**  
   UI, lógica de negocio y acceso a datos están separados.

3. **Arquitectura por features**  
   El proyecto se organiza por módulos funcionales.

4. **Servicios para lógica financiera**  
   Los cálculos financieros no deben estar en componentes UI.

5. **Estado global mínimo**  
   Zustand se usa solo para estado de UI y filtros.

6. **Código técnico en inglés, UI en español**

---

# 3. Stack tecnológico

## Core
- React Native
- TypeScript
- Expo
- Expo Router

## Persistencia
- SQLite (expo-sqlite)

## Estado
- Zustand

## Formularios
- React Hook Form
- Zod

## Utilidades
- date-fns
- uuid

## Gráficos
- Victory Native / similar

---

# 4. Estructura de carpetas
src/
app/
components/
features/
database/
store/
lib/
theme/
content/
types/

## Estructura detallada
src/
app/
_layout.tsx
(tabs)/
_layout.tsx
index.tsx
movements.tsx
new-movement.tsx
budgets.tsx
settings.tsx
accounts/
new.tsx
[id].tsx
categories/
new.tsx
[id].tsx
economic-data/
index.tsx
backup/
index.tsx

components/
ui/
charts/
layout/

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
app.store.ts
filters.store.ts
ui.store.ts

lib/
dates/
money/
validation/
constants/
helpers/

theme/
content/
types/

---

# 5. Capas de la aplicación

## UI Layer
Pantallas y componentes visuales.

Ubicación:
src/app/
src/components/

### Responsabilidades:
- Renderizar UI
- Manejar navegación
- Formularios
- Llamar hooks

La UI **no debe contener lógica financiera ni SQL**.

---

## Feature Layer
Contiene la lógica por módulo del negocio.

Ubicación:
src/features/

Cada feature puede contener:
feature/
components/
hooks/
services/
repository/
types/
utils/


Features principales:
- accounts
- transactions
- budgets
- dashboard
- salary
- economicData
- settings

---

## Domain / Services Layer
Contiene la lógica financiera y reglas de negocio.

Ejemplos:
- cálculo de saldo
- balance mensual
- presupuesto consumido
- sueldo en USD
- sueldo real
- variaciones salariales

Ubicación:
src/features/*/services/
src/lib/money/

---

## Data Layer
Acceso a SQLite mediante repositorios.

Ubicación:
src/database/

Contiene:
- conexión SQLite
- migraciones
- repositorios
- seeds
- queries

La UI nunca debe ejecutar SQL directamente.

---

## State Layer
Estado global con Zustand.

Ubicación:
src/store/

Usar Zustand para:
- mes seleccionado
- filtros
- estado UI
- modales
- loading
- preferencias

No usar Zustand como base de datos.

---

# 6. Flujo de datos

Flujo estándar:
Screen
-> Feature Hook
-> Service / Use Case
-> Repository
-> SQLite
-> Repository
-> Service
-> Hook
-> Screen

Para estado UI:
Screen
-> Zustand Store
-> Screen

---

# 7. Responsabilidades por feature

## Accounts
Responsable de:
- CRUD cuentas
- saldo inicial
- saldo actual
- tipo de cuenta

## Transactions
Responsable de:
- ingresos
- gastos
- transferencias
- rendimientos
- filtros
- listados

## Budgets
Responsable de:
- presupuesto mensual por categoría
- cálculo de uso
- alertas de exceso

## Dashboard
Responsable de:
- patrimonio total
- resumen mensual
- ingresos/gastos/rendimientos
- snapshot de cuentas

## Salary
Responsable de:
- sueldo mensual
- sueldo en USD
- variación mensual
- sueldo real por inflación

## Economic Data
Responsable de:
- dólar oficial mensual
- inflación mensual

## Settings
Responsable de:
- cuentas
- categorías
- datos económicos
- backup

---

# 8. Base de datos SQLite

SQLite es la fuente de verdad.

Repositorios recomendados:

- account.repository.ts
- category.repository.ts
- transaction.repository.ts
- budget.repository.ts
- economicData.repository.ts

La base debe inicializar:
- tablas
- índices
- categorías por defecto

---

# 9. Stores de Zustand

## app.store
- selectedMonth
- selectedYear
- appLoaded
- onboardingCompleted

## filters.store
- transactionFilters
- dashboardFilters

## ui.store
- modals
- loading
- snackbars
- bottom sheets

---

# 10. Convención de hooks

Ejemplos:
- useDashboardSummary()
- useAccountsWithBalance()
- useTransactions()
- useBudgetStatus()
- useSalaryAnalysis()

Los hooks llaman servicios y repositorios, no SQL directo.

---

# 11. Formularios

Todos los formularios deben usar:
- React Hook Form
- Zod

Formularios principales:
- nueva cuenta
- nueva categoría
- nuevo movimiento
- presupuesto mensual
- dato económico mensual

---

# 12. Navegación (Expo Router)

Estructura recomendada:
app/
_layout.tsx
(tabs)/
_layout.tsx
index.tsx
movements.tsx
new-movement.tsx
budgets.tsx
settings.tsx
accounts/
categories/
economic-data/
backup/


---

# 13. Cálculos financieros

Los cálculos deben vivir en services o lib, nunca en componentes.

Cálculos principales:
- account balance
- total money
- monthly balance
- budget usage
- salary USD
- salary variation
- real salary

---

# 14. Reglas de arquitectura

Reglas importantes del proyecto:

1. No SQL en componentes
2. No cálculos financieros en UI
3. SQLite es la fuente de verdad
4. Zustand solo para estado UI
5. Servicios para lógica financiera
6. Repositorios para acceso a datos
7. Arquitectura por features
8. Código en inglés
9. UI en español
10. Componentes UI reutilizables en `/components`
11. Cada feature maneja su lógica
12. Formularios con React Hook Form + Zod

---

# 15. Arquitectura resumida

Arquitectura general:


Expo Router (Navigation)
|
Screens / UI
|
Feature Hooks
|
Services / Business Logic
|
Repositories
|
SQLite Database


Estado global:

Zustand Store -> UI


Helpers:

lib/


---

# 16. Objetivo de esta arquitectura

Esta arquitectura busca:

- Escalabilidad
- Mantenibilidad
- Separación de responsabilidades
- Facilidad para agregar backend en el futuro
- Facilidad para testing
- Compatibilidad con agentes AI
- Código ordenado
- Proyecto profesional
