// Builds everything the site derives from the public GraphQL schema:
//   1. public/schema.graphql — the downloadable SDL, served at /schema.graphql
//   2. content/reference/    — the generated API Reference (via @graphql-markdown/cli)
//
// The only source is schema/schema.public.gql, which the backend's CI syncs after each production deploy
// (see schema/README.md). Never hand-edit it.
//
// The CLI (@graphql-markdown/cli@0.7.x) is driven by graphql-config: it reads ./graphql.config.js, whose `schema`
// points at .schema/schema.public.gql and whose `extensions['graphql-markdown']` block holds the generator settings.

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'

const SOURCE_SDL = 'schema/schema.public.gql'
const WORK_SDL = '.schema/schema.public.gql'
const PUBLIC_SDL = 'public/schema.graphql'
// Second path: the admin panel's Developer panel links to /schema.public.gql
const PUBLIC_SDL_ALIAS = 'public/schema.public.gql'

const main = async () => {
	if (!existsSync(SOURCE_SDL)) {
		console.error(
			`[gen-reference] ${SOURCE_SDL} is missing. It is synced from the backend's CI after each production deploy; restore it from git (git checkout -- ${SOURCE_SDL}).`
		)
		process.exit(1)
	}

	await mkdir('.schema', { recursive: true })
	await mkdir('public', { recursive: true })
	await copyFile(SOURCE_SDL, WORK_SDL)
	await copyFile(SOURCE_SDL, PUBLIC_SDL)
	await copyFile(SOURCE_SDL, PUBLIC_SDL_ALIAS)
	console.log(`[gen-reference] ${SOURCE_SDL} -> ${WORK_SDL}, ${PUBLIC_SDL}, ${PUBLIC_SDL_ALIAS}`)

	// Reference section landing page shown at /reference. gqlmd copies this file by basename into content/reference/,
	// so it must be named index.md. It lives in the gitignored .schema/ working dir to avoid a stray route.
	await writeFile(
		'.schema/index.md',
		'# API Reference\n\nGenerated from the public GraphQL schema ([download it](/schema.graphql)). Do not edit by hand.\n',
		'utf8'
	)
	execFileSync('npx', ['gqlmd', 'graphql-to-doc', '--force'], { stdio: 'inherit' })
	console.log('[gen-reference] reference generated at content/reference')
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
