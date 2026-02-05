import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents } from '@/mdx-components'

export const generateStaticParams = generateStaticParamsFor

export default async function Page(props) {
    const params = await props.params
    const { default: MDXContent, toc, metadata } = await importPage(params.mdxPath)
    return <MDXContent {...props} components={useMDXComponents} />
}
