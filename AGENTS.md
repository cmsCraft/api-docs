# api-docs

> Public documentation site for the cms-craft public GraphQL API (https://docs.cms-craft.com). Nextra 4 on Next.js 16,
> static export. This repository is public: write nothing here that an outside reader should not see.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server (`predev` regenerates the reference first) |
| `pnpm build` | Static export into `out/` (`prebuild` regenerates the reference, then validates the examples) |
| `pnpm lint` | `biome check .` |
| `pnpm gen:reference` | `scripts/gen-reference.mjs`: `public/schema.graphql` + `content/reference/` |
| `pnpm check:examples` | `scripts/check-examples.mjs`: validates every `graphql` block in `content/` |

## Architecture

- One catch-all route (`app/[[...mdxPath]]/page.jsx`) turns every `content/**/*.mdx` / `.md` file into a page.
  Sidebar labels and order come from `content/_meta.js` and `content/guides/_meta.js`.
- `schema/schema.public.gql` is the single schema source. It is copied from main-craft's public schema;
  main-craft CI opens a `bot/schema-sync` PR when it changes (never edit it by hand except to sync).
- `scripts/gen-reference.mjs` exits 1 if that file is missing; otherwise it copies it to `public/schema.graphql`
  (served as `/schema.graphql`) and to `.schema/schema.public.gql`, writes the reference landing page to
  `.schema/index.md`, and runs `gqlmd graphql-to-doc` (`@graphql-markdown/cli`), which reads `graphql.config.js` and
  writes `content/reference/`. It then writes an `index.md` into every reference folder that has none, listing the
  folder's children.
- **Every folder needs an `index` page** (`asIndexPage: true` in its front matter). The static host serves `/x` from
  `x.html`; a folder with no index page has no `x.html`, so `/x` falls through to the bare directory and answers 403.
- `scripts/check-examples.mjs` parses and validates every fenced `graphql` block in `content/` (except
  `content/reference/`) against the schema and exits 1 on any error. It runs in `prebuild`, so CI and the deploy
  build fail on a broken example.

## Conventions

- Every fact in the docs must match production. Check it against the backend source before writing it, and quote
  real error messages and codes.
- Every `graphql` example must validate (`pnpm check:examples`). Code samples in other languages are not checked
  automatically: keep them small and type-check them by hand when you change them.
- Code samples call the API from the server. `/graphql/public` answers any origin, but a token in browser code is
  visible to every visitor.
- Biome: tabs, single quotes, no semicolons, 120 columns (`biome.json`). `pnpm lint` must pass.
- Never cite internal tickets, people, machines or backend file paths in published pages or in this repo.

## Generated, never edit by hand

| Path | Made by | In git |
|---|---|---|
| `schema/schema.public.gql` | a copy of main-craft's public schema (kept by the `bot/schema-sync` PR) | yes |
| `public/schema.graphql` | `gen-reference.mjs` | no (gitignored) |
| `content/reference/`, `.schema/` | `gen-reference.mjs` | no (gitignored) |
| `out/` | `next build` | no (gitignored) |

## Gotchas

- `zod` is pinned to `4.1.12` with a pnpm override (`package.json`): Nextra 4.6.1 declares `zod ^4.1.12`, but 4.4.x
  broke `z.custom()` handling in its Layout schema.
- Link to `/schema.graphql` with its absolute URL (`https://docs.cms-craft.com/schema.graphql`): it is a static file,
  not a Nextra page.
- Biome skips `schema/` and `public/schema.graphql` (SDL, formatted by the backend).

## Deploy

Coolify serves the static export from `main` at https://docs.cms-craft.com (build `pnpm install && pnpm build`,
output `out`, Node 24).
