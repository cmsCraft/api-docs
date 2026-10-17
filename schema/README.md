`schema.public.gql` is synced from the backend's CI after each production deploy, so it always matches the live API.
Never edit it by hand: the next sync overwrites it.
The docs' API Reference and the downloadable `/schema.graphql` are both built from it (`scripts/gen-reference.mjs`).
