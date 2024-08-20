import {Constants} from "@lib/api/config";

const GET = (async (req, res) => {
    const url = new URL(`${req.url}`, `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 8888}`);
    const targetUrl = url.searchParams.get(Constants.app.request.cacheableRouteParam);
    if (!targetUrl) {
        return new Response(null, {
            status: 400
        })
    }

    console.log(`[cacheable] ${targetUrl}`, targetUrl)

    // 转发资源并且设置缓存
    const aliveTime = Constants.app.request.maxAlive;
    const response = await fetch(
        targetUrl
    );
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', `max-age=${aliveTime}`);
    return new Response(response.body, {
        status: response.status,
        headers
    });
});

export const dynamic = 'force-static';

export {
    GET,
}

