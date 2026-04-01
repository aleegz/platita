Continue the existing "Platita" project.

Now implement the main navigation using Expo Router.

Navigation requirements:
Bottom tabs with:
- Inicio
- Movimientos
- Nuevo movimiento
- Presupuestos
- Ajustes

Important:
- Technical routes/files in English
- Visible tab labels in Spanish
- The central "Nuevo movimiento" tab should be visually emphasized if possible, but keep implementation simple and stable
- Use a clean modern structure
- Do not overdesign yet

Create these screens:
- `src/app/(tabs)/index.tsx` -> Home
- `src/app/(tabs)/movements.tsx`
- `src/app/(tabs)/new-movement.tsx`
- `src/app/(tabs)/budgets.tsx`
- `src/app/(tabs)/settings.tsx`

Also create route placeholders for:
- `src/app/accounts/new.tsx`
- `src/app/accounts/[id].tsx`
- `src/app/categories/new.tsx`
- `src/app/categories/[id].tsx`
- `src/app/economic-data/index.tsx`
- `src/app/backup/index.tsx`

Requirements:
- Tabs working
- Root layout working
- Clean placeholder screens
- Spanish labels visible in UI

Do not implement full feature logic yet.
Expected output:
- stable navigation
- tabs working
- screens connected