// Builds everything the site derives from the public GraphQL schema:
//   1. public/schema.graphql — the downloadable SDL, served at /schema.graphql
//   2. content/reference/    — the generated API Reference (via @graphql-markdown/cli)
//
// The only source is schema/schema.public.gql, copied from main-craft; main-craft CI opens a bot/schema-sync PR when it changes
// (see schema/README.md). Never hand-edit it.
//
// The CLI (@graphql-markdown/cli@0.7.x) is driven by graphql-config: it reads ./graphql.config.js, whose `schema`
// points at .schema/schema.public.gql and whose `extensions['graphql-markdown']` block holds the generator settings.

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SOURCE_SDL = 'schema/schema.public.gql'
const WORK_SDL = '.schema/schema.public.gql'
const PUBLIC_SDL = 'public/schema.graphql'
// Second path: the admin panel's Developer panel links to /schema.public.gql
const PUBLIC_SDL_ALIAS = 'public/schema.public.gql'
const REFERENCE_DIR = 'content/reference'

// Same rule Nextra uses for a folder's sidebar label: `input-types` -> `Input Types`
const titleFromName = (name) =>
	name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

const frontMatterTitle = async (file) => {
	const frontMatter = (await readFile(file, 'utf8')).match(/^---\n([\s\S]*?)\n---/)?.[1]
	return frontMatter?.match(/^title:\s*(.+)$/m)?.[1].trim()
}

// gqlmd creates folders (operations/queries, types/objects, deprecated/…) but no page for them, so a static host
// answers the folder URL with 403. Write an index page into every folder that has none, listing its children.
// `asIndexPage` makes it the folder's own page in the Nextra sidebar instead of an extra child entry.
const writeFolderIndexes = async (dir, route) => {
	const entries = await readdir(dir, { withFileTypes: true })
	const folders = entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))
	const pages = entries.filter(
		(entry) => entry.isFile() && /\.mdx?$/.test(entry.name) && !/^index\.mdx?$/.test(entry.name)
	)
	for (const folder of folders) await writeFolderIndexes(join(dir, folder.name), `${route}/${folder.name}`)
	if (entries.some((entry) => entry.isFile() && /^index\.mdx?$/.test(entry.name))) return

	const pageLinks = await Promise.all(
		pages.map(async (page) => {
			const slug = page.name.replace(/\.mdx?$/, '')
			return { title: (await frontMatterTitle(join(dir, page.name))) ?? slug, href: `${route}/${slug}` }
		})
	)
	pageLinks.sort((a, b) => a.title.localeCompare(b.title))
	const links = [
		...folders.map((folder) => ({ title: titleFromName(folder.name), href: `${route}/${folder.name}` })),
		...pageLinks
	]
	const title = titleFromName(dir.split('/').at(-1))
	const list = links.map((link) => `- [${link.title}](${link.href})`).join('\n')
	await writeFile(
		join(dir, 'index.md'),
		`---\ntitle: ${title}\nasIndexPage: true\n---\n\n# ${title}\n\n${list}\n`,
		'utf8'
	)
}

const main = async () => {
	if (!existsSync(SOURCE_SDL)) {
		console.error(
			`[gen-reference] ${SOURCE_SDL} is missing. It is copied from main-craft (a bot/schema-sync PR keeps it current); restore it from git (git checkout -- ${SOURCE_SDL}).`
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
		'---\ntitle: API Reference\nasIndexPage: true\n---\n\n# API Reference\n\nGenerated from the public GraphQL schema ([download it](/schema.graphql)). Do not edit by hand.\n',
		'utf8'
	)
	execFileSync('npx', ['gqlmd', 'graphql-to-doc', '--force'], { stdio: 'inherit' })
	await writeFolderIndexes(REFERENCE_DIR, '/reference')
	console.log('[gen-reference] reference generated at content/reference')
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
