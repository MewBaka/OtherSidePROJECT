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
                source: '/_next/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    }
}
