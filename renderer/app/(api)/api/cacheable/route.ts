import {Constants} from "@lib/api/config";
import {NextRequest} from "next/server";


const GET = (async (req: NextRequest) => {
    if (!Constants.app.request.useCacheableRoute) {
        return new Response(null, {
            status: 404
        });
    }

    return await get(req);
});

async function get(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const targetUrl = searchParams.get(Constants.app.request.cacheableRouteParam);
    if (!targetUrl) {
        return new Response(null, {
            status: 400
        });
    }

    console.log(`[cacheable] ${targetUrl}`, targetUrl);

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
}

export {
    GET,
}

