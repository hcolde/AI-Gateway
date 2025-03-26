const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const removeHeaders = [
    'Accept-Language',
    'Forwarded',
    'User-Agent',
    'X-Amzn-Trace-Id',
    'X-Forwarded-Host',
]

// 配置代理中间件
app.use('/proxy', createProxyMiddleware({
    target: 'https://httpbin.org', // 默认目标
    changeOrigin: true,
    router: (req) => {
        const path = req.path;
        const service = path.split('/')[1];
        const routes = {
            'openai': 'https://api.openai.com',
            'anthropic': 'https://api.anthropic.com',
            'ipinfo': 'https://ipinfo.in',
            'test': 'https://httpbin.org/anything'
        };
        return routes[service] || 'https://httpbin.org';
    },
    pathRewrite: (path, req) => {
        // Remove /proxy/<service> from the path
        const segments = path.split('/');
        if (segments.length > 2) {
            return '/' + segments.slice(2).join('/');
        }
        return path;
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            for (const header of Object.keys(proxyReq.getHeaders())) {
                if (header.startsWith('X-Vercel') || removeHeaders.includes(header)) {
                    proxyReq.removeHeader(header);
                }
            }

            // proxyReq.removeHeader('x-vercel-forwarded-for');
            // proxyReq.removeHeader('x-vercel-ip-continent');
            // proxyReq.removeHeader('x-vercel-ip-country');
            // proxyReq.removeHeader('x-vercel-ip-country-region');
            // proxyReq.removeHeader('x-vercel-ip-city');
            // proxyReq.removeHeader('x-vercel-ip-latitude');
            // proxyReq.removeHeader('x-vercel-ip-longitude');
            // proxyReq.removeHeader('x-vercel-ip-timezone');
            // proxyReq.removeHeader('x-vercel-ip-postal-code');
        }
    }
}));

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port);
