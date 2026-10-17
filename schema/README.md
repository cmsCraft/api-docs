`schema.public.gql` is copied from main-craft's `src/schema.public.gql`; main-craft CI opens a `bot/schema-sync` PR here when it changes. Never edit by hand except to sync. Merge that PR (after updating the prose it lists) to keep the docs in step with the live API.
Never edit it by hand: the next sync overwrites it.
The docs' API Reference and the downloadable `/schema.graphql` are both built from it (`scripts/gen-reference.mjs`).
