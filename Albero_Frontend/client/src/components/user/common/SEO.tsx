import { Helmet } from 'react-helmet'

const SEO = ({ title = '', description = '', url = '', image = '', type = '', canonical = '', keywords = '' }) => {
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta
                name="description"
                content={description}
            />
            <meta
                name="keywords"
                content={keywords}
            />
            <link
                rel="canonical"
                href={canonical}
            />

            {/* Open Graph / Facebook */}
            <meta
                property="og:type"
                content={type}
            />
            <meta
                property="og:url"
                content={url}
            />
            <meta
                property="og:title"
                content={title}
            />
            <meta
                property="og:description"
                content={description}
            />
            <meta
                property="og:image"
                content={image}
            />

            {/* Twitter */}
            <meta
                name="twitter:card"
                content="summary_large_image"
            />
            <meta
                name="twitter:url"
                content={url}
            />
            <meta
                name="twitter:title"
                content={title}
            />
            <meta
                name="twitter:description"
                content={description}
            />
            <meta
                name="twitter:image"
                content={image}
            />
        </Helmet>
    )
}

export default SEO
