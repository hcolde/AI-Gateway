const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 配置代理中间件
app.use('/proxy', createProxyMiddleware({
    target: 'http://localhost:3000', // 默认目标，实际会被router覆盖
    changeOrigin: true,
    router: {
        'openai': 'https://api.openai.com',
        'anthropic': 'https://api.anthropic.com',
        'ipinfo': 'https://ipinfo.in',
        'test': 'https://httpbin.org/anything',
    },
    pathRewrite: (path, req) => {
        // Remove /proxy/<service> from the path
        const segments = path.split('/');
        if (segments.length > 2) {
            return '/' + segments.slice(2).join('/');
        }
        return path;
    },
    onProxyReq: (proxyReq, req, res) => {
        // proxyReq.removeHeader('User-Agent');
        // proxyReq.removeHeader('Referer');
        // proxyReq.removeHeader('X-Forwarded-For');
        // proxyReq.removeHeader('X-Real-IP');
        // proxyReq.removeHeader('x-vercel-forwarded-for');
        // proxyReq.removeHeader('X-Forwarded-For IP');
        // proxyReq.removeHeader('x-vercel-ip-continent');
        // proxyReq.removeHeader('x-vercel-ip-country');
        // proxyReq.removeHeader('x-vercel-ip-country-region');
        // proxyReq.removeHeader('x-vercel-ip-city');
        // proxyReq.removeHeader('x-vercel-ip-latitude');
        // proxyReq.removeHeader('x-vercel-ip-longitude');
        // proxyReq.removeHeader('x-vercel-ip-timezone');
        // proxyReq.removeHeader('x-vercel-ip-postal-code');
    }
}));

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port);
