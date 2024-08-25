/** @type {import('next').NextConfig} */
module.exports = {
    output: 'export',
    distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    webpack: (config) => {
        return config
    },
    async headers() {
        return [
            {
                source: '/_next/static/media/(.*)', // _next/static/media
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/static/sounds/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            }
        ]
    }
}
