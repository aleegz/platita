# Platita — Remediation Backlog

Checklist vivo para corregir y madurar la aplicación en base a la revisión senior del proyecto.

## Cómo usar este archivo

- Antes de empezar una mejora, revisar este backlog.
- Si el usuario no especifica una tarea, avanzar con el ítem pendiente de mayor prioridad.
- Marcar estados así:
  - `[ ]` pendiente
  - `[-]` en progreso
  - `[x]` completado
  - `[!]` bloqueado o requiere decisión
- Después de cada avance, actualizar:
  - estado
  - archivos tocados
  - nota breve
  - próximos pasos si aparecen

## Hallazgos base que originan este backlog

- No hay tests automatizados.
- No hay lint ni CI.
- La invalidación de datos se hace con contadores manuales en Zustand.
- Hay archivos sobredimensionados en rutas y UI compartida.
- Parte de la lógica pesada vive en hooks en vez de servicios/utilidades puras.
- La generación de IDs usa `Date.now() + Math.random()`.
- `docs/ARCHITECTURE.md` tiene drift respecto al código real.

## Orden de ejecución recomendado

1. Base de calidad
2. Estado y sincronización de datos
3. Refactors estructurales
4. Higiene y documentación

---

## Fase 1 — Base de calidad

### [x] R1. Configurar runner de tests
- **Prioridad:** crítica
- **Depende de:** nada
- **Archivos esperados:** `package.json`, config de tests, setup files
- **Criterio de aceptación:**
  - existe `npm test`
  - existe al menos un test pasando
  - queda claro cómo correr tests localmente
- **Notas:** implementado con `jest` + `jest-expo`, alias `@/` en config, test inicial sobre `budget-calculations` y documentación básica en `README.md`

### [x] R2. Agregar tests al core financiero
- **Prioridad:** crítica
- **Depende de:** R1
- **Archivos objetivo:**
  - `src/features/transactions/service.ts`
  - `src/features/budgets/budget-calculations.ts`
  - `src/database/client/sqlite.ts`
  - `src/features/backup/service.ts`
  - lógica extraída o existente de `src/features/economicData/*`
- **Criterio de aceptación:**
  - reglas de transacciones cubiertas
  - cálculos de presupuestos cubiertos
  - casos borde de backup / SQLite cubiertos
  - casos de error relevantes cubiertos
- **Notas:** cubierto con tests unitarios sobre reglas de transacciones, normalización de bytes SQLite, validación defensiva de backups y lógica de indicadores/datos económicos; se mantuvo el enfoque en servicios y helpers puros antes que UI

### [ ] R3. Agregar ESLint + Prettier
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos esperados:** `package.json`, config de eslint, config de prettier
- **Criterio de aceptación:**
  - existen scripts `lint`, `lint:fix`, `format`
  - el repo pasa lint sin errores críticos

### [ ] R4. Agregar CI mínimo
- **Prioridad:** alta
- **Depende de:** R1, R3
- **Archivos esperados:** `.github/workflows/check.yml`
- **Criterio de aceptación:**
  - CI corre `npm ci`
  - CI corre `npm run typecheck`
  - CI corre `npm run lint`
  - CI corre `npm test`

### [ ] R5. Reemplazar generación débil de IDs
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/features/accounts/service.ts`
  - `src/features/transactions/service.ts`
  - `src/features/budgets/service.ts`
  - `src/features/economicData/service.ts`
  - `src/features/categories/service.ts`
- **Criterio de aceptación:**
  - no se usa `Math.random()` para IDs de dominio
  - el mecanismo elegido funciona en el entorno objetivo de Expo

---

## Fase 2 — Estado y sincronización de datos

### [ ] R6. Reemplazar invalidación manual con contadores
- **Prioridad:** crítica
- **Depende de:** idealmente R1 para poder refactorizar con red de seguridad
- **Archivos objetivo:**
  - `src/store/domain-invalidation.store.ts`
  - `src/features/transactions/hooks.ts`
  - `src/features/accounts/hooks.ts`
  - `src/features/categories/hooks.ts`
  - `src/features/budgets/hooks.ts`
- **Criterio de aceptación:**
  - desaparece el patrón `version++` como base de refresco
  - las mutaciones invalidan/actualizan datos de forma declarativa y consistente
- **Notas:** alternativa recomendada: TanStack Query; alternativa manual: event bus bien definido

### [ ] R7. Sacar lógica pesada de `economicData/hooks.ts`
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/features/economicData/hooks.ts`
  - `src/features/economicData/api.ts`
  - `src/features/economicData/service.ts`
- **Criterio de aceptación:**
  - el hook sólo orquesta estado UI
  - fetch, mapeos y cálculos viven fuera de React
  - la lógica extraída es testeable en forma aislada

### [ ] R8. Extraer la lógica de seguridad a un servicio
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/features/security/hooks.ts`
  - nuevo servicio/helper en `src/features/security/`
- **Criterio de aceptación:**
  - el hook deja de ser la máquina de estados principal
  - la lógica de AppState y grace period queda aislada y testeable

---

## Fase 3 — Refactors estructurales

### [ ] R9. Partir `src/app/(tabs)/index.tsx`
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/app/(tabs)/index.tsx`
  - `src/features/dashboard/components/*`
- **Criterio de aceptación:**
  - la ruta queda como orquestadora
  - los bloques grandes de UI se mueven a componentes propios

### [ ] R10. Partir `src/app/(tabs)/settings.tsx`
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/app/(tabs)/settings.tsx`
  - `src/features/settings/components/*`
- **Criterio de aceptación:**
  - la ruta queda más chica y legible
  - perfil, seguridad y herramientas tienen componentes separados

### [ ] R11. Romper `src/components/AppUi.tsx`
- **Prioridad:** alta
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/components/AppUi.tsx`
  - `src/components/ui/*`
- **Criterio de aceptación:**
  - cada componente compartido vive en su archivo
  - el barrel export sigue siendo fácil de usar

### [ ] R12. Limpiar límites entre tipos y lógica
- **Prioridad:** media
- **Depende de:** nada
- **Archivos objetivo:**
  - `src/types/domain.ts`
  - utilidades nuevas o existentes donde corresponda
- **Criterio de aceptación:**
  - `src/types/*` contiene tipos y helpers mínimos de tipado
  - la lógica funcional sale de la capa de tipos

---

## Fase 4 — Higiene y consistencia

### [ ] R13. Corregir drift de documentación
- **Prioridad:** media
- **Depende de:** nada
- **Archivos objetivo:**
  - `docs/ARCHITECTURE.md`
  - `README.md` si hace falta
- **Criterio de aceptación:**
  - no hay contenido duplicado
  - la documentación coincide con dependencias y estructura real

### [ ] R14. Limpiar imports relativos y ruido del repo
- **Prioridad:** media
- **Depende de:** nada
- **Archivos objetivo:** múltiples `src/**/*.ts(x)` y `.gitkeep` innecesarios
- **Criterio de aceptación:**
  - se aprovecha el alias `@/` donde mejora claridad
  - se eliminan `.gitkeep` en carpetas no vacías

### [ ] R15. Aislar lógica de plataforma en backup
- **Prioridad:** media
- **Depende de:** nada
- **Archivos objetivo:** `src/features/backup/service.ts`
- **Criterio de aceptación:**
  - el servicio de backup no decide directamente por plataforma
  - la dependencia nativa/web entra por adapter o boundary claro

---

## Reglas para siguientes avances

- Si el usuario pide “avanzá” sin más detalle, tomar el próximo `R#` pendiente de mayor prioridad.
- Si el usuario pide un `R#` específico, trabajar ese ítem y luego actualizar este archivo.
- Cada tarea terminada debe dejar nota breve de lo que cambió y qué sigue.

## Registro de progreso

- **R1 completado**
  - **Archivos tocados:** `package.json`, `package-lock.json`, `tsconfig.json`, `jest.config.cjs`, `jest.setup.ts`, `src/features/budgets/budget-calculations.test.ts`, `README.md`
  - **Validación:** `npm test -- --runInBand` y `npm run typecheck`
  - **Siguiente paso natural:** `R2. Agregar tests al core financiero`
- **R2 completado**
  - **Archivos tocados:** `src/features/transactions/service.test.ts`, `src/database/client/sqlite.test.ts`, `src/features/backup/service.test.ts`, `src/features/economicData/service.test.ts`, `src/features/economicData/live-indicators.ts`, `src/features/economicData/live-indicators.test.ts`, `src/features/economicData/hooks.ts`, `docs/REMEDIATION_BACKLOG.md`
  - **Validación:** `npm test -- --runInBand` y `npm run typecheck`
  - **Nota breve:** se agregó cobertura sobre validaciones de transacciones, paths defensivos de backup/import, normalización de imágenes SQLite para deserialize, y transformaciones económicas puras con una extracción mínima desde el hook
  - **Siguiente paso natural:** `R3. Agregar ESLint + Prettier`
