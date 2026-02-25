# Idea Leaderboard

Een desktop applicatie om ideeën en projecten bij te houden en op volgorde van belang te rangschikken. Ideeën worden lokaal opgeslagen in een SQLite database.

## Wat doet de app

- **Ideeën toevoegen** via de groene knop rechtsonder (FAB)
- **Ideeën bewerken** door op een kaart te klikken
- **Volgorde bepalen** door kaarten te slepen (drag & drop) — de volgorde representeert de prioriteit
- **Categorieën** toewijzen aan ideeën
- **Cover afbeelding en album** koppelen aan een idee
- Alle data wordt lokaal opgeslagen; geen account of internet vereist

## Tech stack

| | |
|---|---|
| UI | [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/) (runes) |
| Desktop | [Tauri v2](https://tauri.app/) |
| Database | SQLite via [`@tauri-apps/plugin-sql`](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/sql) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Drag & drop | [svelte-dnd-action](https://github.com/isaacs/node-graceful-fs) |

## Vereisten

- [Rust](https://www.rust-lang.org/tools/install)
- [Bun](https://bun.sh/)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) voor jouw platform

## Installeren en starten

```bash
bun install
bun run tauri:dev
```

## Bouwen

```bash
bun run tauri:build
```

## Database

De app gebruikt Drizzle ORM met SQLite. Na het aanpassen van het schema:

```bash
# Genereer migraties
bun run db:generate

# Bekijk de database via Drizzle Studio
bun run db:studio
```

## Projectstructuur

```
src/
  lib/
    components/     # UI componenten (IdeaCard, IdeaForm, modals, ...)
    db/             # Drizzle schema en database connectie
    ideaStore.svelte.ts  # Globale state (Svelte 5 runes)
    types.ts
  routes/
    +page.svelte    # Hoofd pagina
src-tauri/          # Tauri backend (Rust)
```
