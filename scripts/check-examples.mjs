// Validates every ```graphql block in the hand-written docs against the public schema, so no example can drift from
// the API. Generated reference pages (content/reference/) are skipped. Exits 1 on any parse or validation error.

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildSchema, parse, validate } from 'graphql'

const SCHEMA_SDL = 'schema/schema.public.gql'
const CONTENT_DIR = 'content'
const SKIP_DIR = join(CONTENT_DIR, 'reference')
const BLOCK = /^```graphql[^\n]*\n([\s\S]*?)^```/gm

const listMdx = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true })
	const nested = await Promise.all(
		entries.map((entry) => {
			const path = join(dir, entry.name)
			if (entry.isDirectory()) return path === SKIP_DIR ? [] : listMdx(path)
			return entry.name.endsWith('.mdx') ? [path] : []
		})
	)
	return nested.flat()
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

const checkFile = async (schema, file) => {
	const text = await readFile(file, 'utf8')
	const problems = []
	let count = 0
	for (const match of text.matchAll(BLOCK)) {
		count++
		const line = lineOf(text, match.index)
		try {
			const errors = validate(schema, parse(match[1]))
			for (const error of errors) problems.push(`${file}:${line}: ${error.message}`)
		} catch (error) {
			problems.push(`${file}:${line}: ${error.message}`)
		}
	}
	return { count, problems }
}

const main = async () => {
	const schema = buildSchema(await readFile(SCHEMA_SDL, 'utf8'))
	const files = (await listMdx(CONTENT_DIR)).sort()
	const results = await Promise.all(files.map((file) => checkFile(schema, file)))
	const blocks = results.reduce((sum, result) => sum + result.count, 0)
	const problems = results.flatMap((result) => result.problems)

	if (problems.length > 0) {
		for (const problem of problems) console.error(problem)
		console.error(`[check-examples] ${problems.length} error(s) in ${blocks} graphql block(s)`)
		process.exit(1)
	}
	console.log(`[check-examples] ${blocks} graphql block(s) in ${files.length} file(s) are valid against ${SCHEMA_SDL}`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
