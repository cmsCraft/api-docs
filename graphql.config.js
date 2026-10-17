// graphql-config file consumed by @graphql-markdown/cli (gqlmd).
//
// NOTE on file name & shape: @graphql-markdown/cli@0.7.x is driven by
// graphql-config (cosmiconfig). It discovers `graphql.config.js` (NOT a
// standalone `graphql-markdown.config.js`) and reads the generator settings
// from the `extensions['graphql-markdown']` block below.
//
// The SDL at `./.schema/schema.public.gql` is copied there by
// scripts/gen-reference.mjs from schema/schema.public.gql (synced from the
// backend's CI). Output goes to content/reference (gitignored).
export default {
	schema: './.schema/schema.public.gql',
	extensions: {
		'graphql-markdown': {
			rootPath: './content',
			baseURL: 'reference',
			// gqlmd copies the homepage by basename into content/reference/, so the
			// source must be named index.md to land the section page at /reference.
			// It is written to the gitignored .schema/ working dir by gen-reference.mjs.
			homepage: './.schema/index.md',
			loaders: {
				GraphQLFileLoader: '@graphql-tools/graphql-file-loader'
			},
			printTypeOptions: {
				deprecated: 'group',
				exampleSection: false
			}
		}
	}
}
