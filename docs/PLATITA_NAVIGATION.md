# Platita — Navigation Diagram

Este diagrama representa la navegación principal de la aplicación Platita (MVP).

## Navigation Flow

```mermaid
flowchart TD

    A[App Start] --> B[Inicio / Dashboard]

    B --> C[Movimientos]
    B --> D[Nuevo Movimiento]
    B --> E[Presupuestos]
    B --> F[Ajustes]

    C --> C1[Lista de Movimientos]
    C1 --> D
    C1 --> C2[Filtros]

    D --> D1[Formulario Movimiento]
    D1 --> B
    D1 --> C

    E --> E1[Lista Presupuestos]
    E1 --> E2[Editar Presupuesto]
    E2 --> E1

    F --> F1[Cuentas]
    F --> F2[Categorías]
    F --> F3[Datos Económicos]
    F --> F4[Backup]

    F1 --> F1A[Nueva Cuenta]
    F1 --> F1B[Editar Cuenta]

    F2 --> F2A[Nueva Categoría]
    F2 --> F2B[Editar Categoría]

    F3 --> F3A[Cargar Dólar]
    F3 --> F3B[Cargar Inflación]
```

## Navigation hierarchy

Inicio
 ├── Movimientos
 │    └── Nuevo Movimiento
 ├── Nuevo Movimiento
 ├── Presupuestos
 │    └── Editar Presupuesto
 └── Ajustes
      ├── Cuentas
      │     ├── Nueva Cuenta
      │     └── Editar Cuenta
      ├── Categorías
      │     ├── Nueva Categoría
      │     └── Editar Categoría
      ├── Datos Económicos
      │     ├── Dólar
      │     └── Inflación
      └── Backup