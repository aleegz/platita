# Platita

Platita is a local-first personal finance mobile app for Argentina built with Expo, React Native, TypeScript, and Expo Router.

This repository currently contains the initial MVP-ready scaffold:

- Expo + React Native + TypeScript base
- Expo Router configured with `src/app`
- Minimal root layout and home placeholder
- Feature, database, theme, content, and shared folders created under `src/`
- No backend, authentication, cloud sync, Redux, or business logic yet

## Requirements

- Node.js 20.19.4 or newer
- npm 10+

## Getting started

```bash
npm install
npm run start
```

If you use Expo Go on a physical device, this project is aligned to Expo SDK 54.

## Available scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Project structure

```text
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
```

## Notes

- UI copy is intentionally in Spanish.
- Technical code is written in English.
- Database, state, and feature folders are placeholders for the next implementation phase.
