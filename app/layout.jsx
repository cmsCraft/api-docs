import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'

export const metadata = {
	title: { default: 'CMS Craft API', template: '%s — CMS Craft API' },
	description: 'Public GraphQL API for the CMS Craft headless CMS'
}

const navbar = <Navbar logo={<b>CMS Craft API</b>} />
const footer = <Footer>© {new Date().getFullYear()} CMS Craft</Footer>

export default async function RootLayout({ children }) {
	return (
		<html lang="en" dir="ltr" suppressHydrationWarning>
			<Head />
			<body>
				<Layout
					navbar={navbar}
					footer={footer}
					pageMap={await getPageMap()}
					docsRepositoryBase="https://github.com/cmsCraft/api-docs/tree/main"
				>
					{children}
				</Layout>
			</body>
		</html>
	)
}
