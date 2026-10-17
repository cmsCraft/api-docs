import nextra from 'nextra'

const withNextra = nextra({
	// Nextra 4 reads MDX from the `content/` dir via the app-router catch-all
	contentDirBasePath: '/'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	images: { unoptimized: true } // required for static export
}

export default withNextra(nextConfig)
