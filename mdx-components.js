import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'

const themeComponents = getThemeComponents()

// content/reference is generated at build time by scripts/gen-reference.mjs and is not in git, so its
// "Edit this page" link would 404. Nextra 4.6 has no per-page edit-link option; the theme renders the
// link only when metadata.filePath is set, so drop it for generated pages.
const GENERATED_DIR = 'content/reference/'

const ThemeWrapper = themeComponents.wrapper

const wrapper = ({ metadata, ...props }) => (
	<ThemeWrapper
		{...props}
		metadata={metadata.filePath?.startsWith(GENERATED_DIR) ? { ...metadata, filePath: undefined } : metadata}
	/>
)

export function useMDXComponents(components) {
	return { ...themeComponents, wrapper, ...components }
}
