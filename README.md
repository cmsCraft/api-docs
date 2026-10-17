# cms-craft API docs

Public documentation for the cms-craft public GraphQL API, live at https://docs.cms-craft.com. Built with Nextra 4
on Next.js 16 as a static export.

## Develop

```bash
pnpm install
pnpm dev   # regenerates the API Reference, then runs Next.js on :3000 (pass --port to change it)
```

Hand-written pages are MDX under `content/` (sidebar order in the `_meta.js` files). The API Reference under
`content/reference/` is generated, never edited by hand.

## The schema

`schema/schema.public.gql` is the public schema. It is copied from main-craft's published public schema when the
API changes (a manual copy for now); never edit its contents. Everything schema-derived is built from it:

- `scripts/gen-reference.mjs` copies it to `public/schema.graphql` (served as `/schema.graphql`) and generates
  `content/reference/` with `@graphql-markdown/cli`. Both outputs are gitignored.
- `scripts/check-examples.mjs` parses and validates every `graphql` code block in `content/` (outside
  `content/reference/`) against it and fails on any error, so an example can never drift from the API.

```bash
pnpm gen:reference    # reference + public/schema.graphql
pnpm check:examples   # validate the docs' GraphQL examples
```

## Build

```bash
pnpm lint    # biome check .
pnpm build   # gen-reference, check-examples, then the static export into out/
```

## Deploy

Coolify serves the static export from `main` at https://docs.cms-craft.com: build command
`pnpm install && pnpm build`, output directory `out`, Node 24.
