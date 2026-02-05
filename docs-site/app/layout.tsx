import './globals.css'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

export const metadata = {
    title: 'QuizCreator Docs',
    description: 'QuizCreator Documentation Site',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const pageMap = await getPageMap()
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head />
            <body className="antialiased">
                <Layout
                    navbar={<Navbar logo={<b>QuizCreator</b>} />}
                    footer={<Footer>QuizCreator Documentation</Footer>}
                    pageMap={pageMap}
                >
                    {children}
                </Layout>
            </body>
        </html>
    )
}
