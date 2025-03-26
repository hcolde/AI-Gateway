const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const removeHeaders = [
    'accept-language',
    'forwarded',
    'user-agent',
    'x-amzn-trace-id',
    'x-forwarded-host',
]

// 配置代理中间件
app.use('/proxy', createProxyMiddleware({
    target: 'https://httpbin.org', // 默认目标
    changeOrigin: true,
    xfwd: false,
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
                if (header.toLowerCase().startsWith('x-vercel') || removeHeaders.includes(header.toLowerCase())) {
                    proxyReq.removeHeader(header);
                }
            }
        }
    }
}));

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port);
