# Platita — Especificación Funcional y Técnica (MVP)

## 1. Visión del producto

**Platita** es una aplicación móvil de finanzas personales orientada a usuarios en Argentina que desean:

- Registrar ingresos y gastos
- Gestionar múltiples cuentas
- Controlar presupuestos por categoría
- Visualizar su patrimonio total
- Registrar rendimientos financieros
- Analizar la evolución real de su sueldo considerando inflación y dólar oficial

El diferencial del producto es el **análisis del poder adquisitivo real del sueldo**, no solo el registro de gastos.

---

# 2. Objetivo del MVP

El MVP debe permitir:

1. Crear cuentas con saldo inicial
2. Registrar ingresos
3. Registrar gastos
4. Registrar transferencias entre cuentas
5. Registrar rendimientos manuales
6. Ver dinero total disponible
7. Ver resumen mensual
8. Configurar presupuestos por categoría
9. Cargar inflación mensual
10. Cargar dólar oficial mensual
11. Analizar sueldo en ARS, USD y real
12. Exportar backup de datos
13. Persistencia local sin backend

## Fuera de alcance del MVP

- Sincronización cloud
- Scraping automático
- Conexión bancaria
- OCR de tickets
- Predicciones
- IA
- Presupuestos inteligentes
- Inversiones complejas
- Multiusuario

---

# 3. Navegación principal

La aplicación tendrá una navegación inferior con 5 secciones:

1. Inicio
2. Movimientos
3. Nuevo movimiento (botón central)
4. Presupuestos
5. Ajustes

---

# 4. Pantallas del sistema

## 4.1 Pantalla Inicio (Dashboard)

Debe mostrar:

### Patrimonio
- Dinero total disponible
- Lista de cuentas con saldo
- Distribución por cuentas (opcional gráfico)

### Mes actual
- Ingresos del mes
- Gastos del mes
- Balance del mes
- Rendimientos del mes

### Presupuestos
- Presupuesto por categoría
- Gastado actual
- Alertas de exceso

### Sueldo
- Sueldo del mes
- Sueldo en USD oficial
- Variación vs mes anterior
- Variación real vs inflación

---

## 4.2 Pantalla Movimientos

Lista de movimientos con:

- Fecha
- Monto
- Categoría
- Cuenta
- Tipo
- Nota

Filtros:
- Mes
- Tipo
- Cuenta
- Categoría

---

## 4.3 Pantalla Nuevo Movimiento

Campos:

- Tipo (ingreso / gasto / transferencia / rendimiento)
- Monto
- Categoría
- Cuenta origen
- Cuenta destino (si transferencia)
- Fecha
- Nota

### Reglas

- Ingreso aumenta saldo
- Gasto reduce saldo
- Transferencia mueve dinero entre cuentas
- Rendimiento aumenta saldo

---

## 4.4 Pantalla Presupuestos

Lista de categorías con:

- Presupuesto mensual
- Gastado actual
- Restante
- Porcentaje consumido
- Estado (normal / advertencia / excedido)

Estados:
- < 80% normal
- 80–100% advertencia
- > 100% excedido

---

## 4.5 Pantalla Ajustes

Secciones:

### Cuentas
- Crear cuenta
- Editar cuenta
- Saldo inicial
- Tipo de cuenta

### Categorías
- Crear categoría
- Editar categoría
- Tipo

### Datos Económicos
- Dólar oficial mensual
- Inflación mensual

### Backup
- Exportar datos
- Importar datos

---

# 5. Modelo de Datos

## Account
- id
- name
- type
- initial_balance
- active
- created_at

Tipos:
- cash
- bank
- wallet
- investment

## Category
- id
- name
- type (income / expense / rendimiento)
- active

## Transaction
- id
- type (income / expense / transfer / rendimiento)
- amount
- date
- account_from_id
- account_to_id
- category_id
- note
- created_at

## MonthlyBudget
- id
- category_id
- month
- year
- budget_amount

## EconomicData
- id
- month
- year
- dollar_official
- inflation_monthly

---

# 6. Reglas de negocio

## Saldo de cuenta
account_balance =
initial_balance
+ ingresos
+ rendimientos
- gastos
+ transferencias_recibidas
- transferencias_enviadas

## Patrimonio total
total_money = suma de todos los saldos de cuentas

## Balance mensual
monthly_balance = ingresos + rendimientos - gastos

## Uso de presupuesto
budget_usage = gasto_categoria / presupuesto_categoria

## Sueldo en USD
salary_usd = salary_ars / dollar_official

## Variación sueldo USD
variation_usd = salary_usd_mes_actual - salary_usd_mes_anterior

## Sueldo real por inflación
salary_real = salary / inflation_index

---

# 7. Arquitectura Técnica

## Stack tecnológico

- React Native
- TypeScript
- Expo
- Expo Router
- SQLite
- Zustand
- React Hook Form
- Zod
- Librería de gráficos
- date-fns

---

# 8. Arquitectura de carpetas

src/
  app/
  components/
  features/
    accounts/
    transactions/
    budgets/
    dashboard/
    salary/
    settings/
    economic-data/
  database/
  store/
  lib/
  theme/
  content/

---

# 9. Arquitectura del sistema

Capas del sistema:

## UI Layer
Pantallas y componentes visuales.

## State Layer
Estado global con Zustand.

## Domain Layer
Reglas de negocio y cálculos financieros.

## Data Layer
SQLite, repositories y queries.

SQLite es la fuente de verdad.

---

# 10. Roadmap de desarrollo

## Fase 1
- Setup proyecto
- Navegación
- Tema visual
- Cuentas
- Categorías

## Fase 2
- Movimientos
- Transferencias
- Cálculo de saldos
- Dashboard básico

## Fase 3
- Presupuestos
- Alertas de presupuesto

## Fase 4
- Datos económicos
- Análisis salarial
- Gráficos

## Fase 5
- Backup export/import

## Fase 6 (futuro)
- Sync cloud
- iOS
- Web
- Automatización datos económicos

---

# 11. Principios de diseño del producto

La app debe ser:

- Simple
- Rápida
- Clara
- Confiable
- Local-first
- Sin métricas engañosas
- Orientada a control financiero real
- Enfocada en Argentina
- Moderna visualmente
- Amigable
- No bancaria
- No infantil

La app debe transmitir:
**“Entiendo mi plata.”**

---

# 12. Resumen final del MVP

El MVP de Platita debe permitir:

- Crear cuentas con saldo inicial
- Registrar ingresos
- Registrar gastos
- Registrar transferencias
- Registrar rendimientos mensuales
- Ver dinero total
- Ver saldos por cuenta
- Ver ingresos y gastos del mes
- Ver balance
- Configurar presupuestos
- Ver consumo de presupuestos
- Cargar dólar oficial mensual
- Cargar inflación mensual
- Analizar sueldo en ARS, USD y real
- Exportar backup
- Persistencia local