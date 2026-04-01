# Platita — DATABASE_SCHEMA.md

## 1. Objetivo

Este documento define el esquema inicial de base de datos SQLite para el MVP de **Platita**.

La base de datos está diseñada para soportar un enfoque **local-first**, con persistencia en el dispositivo, sin backend en la primera versión.

SQLite será la **fuente de verdad** para:

- cuentas
- categorías
- movimientos
- presupuestos mensuales
- datos económicos mensuales

---

## 2. Principios del esquema

1. **Simplicidad antes que sobreingeniería**
2. **Normalización razonable para MVP**
3. **Compatibilidad con análisis y reportes mensuales**
4. **Escalable a futuro**
5. **Campos y nombres técnicos en inglés**

---

## 3. Convenciones generales

### Identificadores
- Se usará `TEXT` como tipo de `id`
- Los IDs serán generados por la aplicación (UUID o similar)

### Fechas
- Las fechas completas se almacenan en formato ISO 8601 como `TEXT`
- Ejemplo: `2026-03-23T15:30:00Z`
- Para operaciones mensuales se usarán además campos `month` y `year` cuando convenga

### Montos
- Todos los montos se almacenarán como `INTEGER` en la unidad mínima de moneda
- En ARS, esto significa almacenar centavos

Ejemplo:
- `$10,50` → `1050`
- `$1000,00` → `100000`

Esto evita errores de precisión con `REAL`.

### Soft delete
Para el MVP **no se implementará soft delete**.
Se usarán campos `active` en entidades configurables.

---

## 4. Tablas principales

### 4.1 `accounts`
Representa cuentas del usuario.

Ejemplos:
- Mercado Pago
- Santander
- Efectivo
- Naranja X

#### Columnas
| Column | Type | Null | Description |
|---|---|---:|---|
| id | TEXT | No | Primary key |
| name | TEXT | No | Nombre de la cuenta |
| type | TEXT | No | Tipo de cuenta |
| initial_balance | INTEGER | No | Saldo inicial en centavos |
| active | INTEGER | No | 1 = activa, 0 = inactiva |
| created_at | TEXT | No | Fecha de creación |
| updated_at | TEXT | No | Fecha de actualización |

#### Restricciones
- `type` permitido:
  - `cash`
  - `bank`
  - `wallet`
  - `investment`
- `initial_balance >= 0`
- `active IN (0,1)`

#### SQL
```sql
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'wallet', 'investment')),
  initial_balance INTEGER NOT NULL DEFAULT 0 CHECK (initial_balance >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

### 4.2 `categories`
Representa categorías de ingresos, gastos o rendimientos.

#### Columnas
| Column | Type | Null | Description |
|---|---|---:|---|
| id | TEXT | No | Primary key |
| name | TEXT | No | Nombre de la categoría |
| type | TEXT | No | Tipo de categoría |
| active | INTEGER | No | 1 = activa, 0 = inactiva |
| created_at | TEXT | No | Fecha de creación |
| updated_at | TEXT | No | Fecha de actualización |

#### Restricciones
- `type` permitido:
  - `income`
  - `expense`
  - `yield`
- `active IN (0,1)`
- combinación única sugerida: `name + type`

#### SQL
```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'yield')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(name, type)
);
```

---

### 4.3 `transactions`
Tabla central del sistema.

Representa:
- ingresos
- gastos
- transferencias
- rendimientos

#### Diseño elegido
Para simplificar la lógica:
- `income`, `expense`, `yield` usan `account_id`
- `transfer` usa `from_account_id` y `to_account_id`
- `category_id` es obligatorio en `income`, `expense` y `yield`
- `category_id` es opcional en `transfer`

#### Columnas
| Column | Type | Null | Description |
|---|---|---:|---|
| id | TEXT | No | Primary key |
| type | TEXT | No | Tipo de movimiento |
| amount | INTEGER | No | Monto en centavos |
| date | TEXT | No | Fecha del movimiento |
| account_id | TEXT | Sí | Cuenta para ingreso/gasto/rendimiento |
| from_account_id | TEXT | Sí | Cuenta origen para transferencia |
| to_account_id | TEXT | Sí | Cuenta destino para transferencia |
| category_id | TEXT | Sí | Categoría asociada |
| note | TEXT | Sí | Nota opcional |
| created_at | TEXT | No | Fecha de creación |
| updated_at | TEXT | No | Fecha de actualización |

#### Restricciones funcionales
- `type` permitido:
  - `income`
  - `expense`
  - `transfer`
  - `yield`
- `amount > 0`
- Si `type = 'transfer'`:
  - `from_account_id` requerido
  - `to_account_id` requerido
  - `from_account_id != to_account_id`
- Si `type IN ('income', 'expense', 'yield')`:
  - `account_id` requerido
- Si `type IN ('income', 'expense', 'yield')`:
  - `category_id` requerido

> Nota: SQLite no resuelve elegantemente toda esta lógica con `CHECK` complejos cross-column. Parte de estas validaciones deben reforzarse en capa de aplicación.

#### SQL
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'yield')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  account_id TEXT,
  from_account_id TEXT,
  to_account_id TEXT,
  category_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  CHECK (
    (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND from_account_id != to_account_id)
    OR
    (type IN ('income', 'expense', 'yield') AND account_id IS NOT NULL AND category_id IS NOT NULL)
  )
);
```

---

### 4.4 `monthly_budgets`
Presupuesto mensual por categoría de gasto.

#### Columnas
| Column | Type | Null | Description |
|---|---|---:|---|
| id | TEXT | No | Primary key |
| category_id | TEXT | No | Categoría de gasto |
| month | INTEGER | No | Mes (1-12) |
| year | INTEGER | No | Año |
| budget_amount | INTEGER | No | Presupuesto en centavos |
| created_at | TEXT | No | Fecha de creación |
| updated_at | TEXT | No | Fecha de actualización |

#### Restricciones
- `month BETWEEN 1 AND 12`
- `budget_amount >= 0`
- único por `category_id + month + year`
- solo debería aplicar a categorías de tipo `expense`

> La validación de que la categoría sea `expense` debe reforzarse en aplicación.

#### SQL
```sql
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  budget_amount INTEGER NOT NULL DEFAULT 0 CHECK (budget_amount >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  UNIQUE(category_id, month, year)
);
```

---

### 4.5 `economic_data`
Datos económicos mensuales para análisis salarial.

#### Columnas
| Column | Type | Null | Description |
|---|---|---:|---|
| id | TEXT | No | Primary key |
| month | INTEGER | No | Mes (1-12) |
| year | INTEGER | No | Año |
| dollar_official | INTEGER | No | Cotización oficial en centavos |
| inflation_monthly_basis_points | INTEGER | No | Inflación mensual en basis points |
| created_at | TEXT | No | Fecha de creación |
| updated_at | TEXT | No | Fecha de actualización |

#### Decisión de modelado
Para mantener precisión:
- `dollar_official` se guarda en centavos de ARS por USD
- `inflation_monthly_basis_points` se guarda en **basis points**

Ejemplos:
- inflación 2,50% → `250`
- inflación 10,20% → `1020`

#### Restricciones
- `month BETWEEN 1 AND 12`
- único por `month + year`
- `dollar_official > 0`
- `inflation_monthly_basis_points >= 0`

#### SQL
```sql
CREATE TABLE IF NOT EXISTS economic_data (
  id TEXT PRIMARY KEY NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  dollar_official INTEGER NOT NULL CHECK (dollar_official > 0),
  inflation_monthly_basis_points INTEGER NOT NULL CHECK (inflation_monthly_basis_points >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(month, year)
);
```

---

## 5. Índices recomendados

Para mejorar performance en listados y resúmenes mensuales:

```sql
CREATE INDEX IF NOT EXISTS idx_accounts_active
  ON accounts(active);

CREATE INDEX IF NOT EXISTS idx_categories_type_active
  ON categories(type, active);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON transactions(date);

CREATE INDEX IF NOT EXISTS idx_transactions_type_date
  ON transactions(type, date);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
  ON transactions(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_from_account_id
  ON transactions(from_account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_to_account_id
  ON transactions(to_account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
  ON transactions(category_id);

CREATE INDEX IF NOT EXISTS idx_monthly_budgets_period
  ON monthly_budgets(year, month);

CREATE INDEX IF NOT EXISTS idx_economic_data_period
  ON economic_data(year, month);
```

---

## 6. Seeds iniciales

### Categorías iniciales sugeridas

#### Income
- Sueldo
- Ingreso extra

#### Expense
- Comida
- Transporte
- Alquiler
- Servicios
- Salud
- Ocio
- Educación
- Impuestos

#### Yield
- Rendimientos

### SQL de ejemplo
```sql
INSERT OR IGNORE INTO categories (id, name, type, active, created_at, updated_at) VALUES
('cat_income_salary', 'Sueldo', 'income', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_income_extra', 'Ingreso extra', 'income', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_food', 'Comida', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_transport', 'Transporte', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_rent', 'Alquiler', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_services', 'Servicios', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_health', 'Salud', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_leisure', 'Ocio', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_education', 'Educación', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_expense_taxes', 'Impuestos', 'expense', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_yield_returns', 'Rendimientos', 'yield', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

## 7. Reglas de integridad en aplicación

Además de las restricciones SQL, la app debe validar:

### Accounts
- no permitir nombre vacío
- no permitir balances negativos en `initial_balance`

### Categories
- no permitir nombre vacío
- no permitir categorías duplicadas por `name + type`

### Transactions
- `amount > 0`
- `income`, `expense`, `yield` requieren `account_id`
- `income`, `expense`, `yield` requieren `category_id`
- `transfer` requiere `from_account_id` y `to_account_id`
- `transfer` no puede usar misma cuenta origen/destino
- `transfer` no debe afectar ingresos/gastos globales
- `yield` debe contarse como rendimiento financiero separado

### Monthly Budgets
- solo deben aplicarse a categorías `expense`
- un solo presupuesto por categoría y período

### Economic Data
- una sola fila por mes/año
- no permitir dólar <= 0
- no permitir inflación negativa en MVP

---

## 8. Reglas derivadas de negocio

### Saldo actual de una cuenta
```text
current_balance =
  initial_balance
  + income_total
  + yield_total
  - expense_total
  + transfer_in_total
  - transfer_out_total
```

### Patrimonio total
```text
total_money = sum(current_balance of all active accounts)
```

### Balance mensual
```text
monthly_balance = income_total + yield_total - expense_total
```

### Uso de presupuesto
```text
budget_usage = category_expense_total / budget_amount
```

### Sueldo en USD
```text
salary_usd = salary_ars / dollar_official
```

### Variación real simplificada
```text
real_variation = salary_variation - inflation_variation
```

> La fórmula exacta refinada puede evolucionar en versiones futuras.

---

## 9. Estrategia de migraciones

### Versión inicial
Se recomienda definir un archivo de bootstrap con:
- creación de tablas
- creación de índices
- seed de categorías

### Evolución futura
Agregar tabla de migraciones, por ejemplo:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL
);
```

Y aplicar migraciones incrementales:
- v1: tablas base
- v2: nuevos índices
- v3: columnas nuevas
- etc.

---

## 10. Orden recomendado de creación

```sql
-- 1. accounts
-- 2. categories
-- 3. transactions
-- 4. monthly_budgets
-- 5. economic_data
-- 6. indexes
-- 7. seeds
```

---

## 11. Resumen final

El esquema inicial de base de datos de Platita MVP incluye:

- `accounts`
- `categories`
- `transactions`
- `monthly_budgets`
- `economic_data`

Con este esquema ya se puede soportar:

- cuentas con saldo inicial
- ingresos
- gastos
- transferencias
- rendimientos manuales
- presupuestos por categoría
- carga de dólar oficial mensual
- carga de inflación mensual
- análisis salarial básico
- dashboard financiero mensual

Este diseño prioriza simplicidad, claridad y estabilidad para el MVP, dejando margen de crecimiento para futuras versiones.

