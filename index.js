const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const net = require('net');

const app = express();

// 添加前置中间件来清理请求
app.use((req, res, next) => {
    // 清除所有可能暴露IP的头部
    req.connection.remoteAddress = '0.0.0.0';
    req.socket.remoteAddress = '0.0.0.0';
    if (req.connection.socket) {
        req.connection.socket.remoteAddress = '0.0.0.0';
    }
    next();
});

const removeHeaders = [
    'accept-language',
    'forwarded',
    'user-agent',
    'x-forwarded',
    'x-vercel',
    'x-real-ip',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'via',
    'cf-connecting-ip',
    'cf-ipcountry',
    'true-client-ip',
    'cf-ray',
    'cf-visitor',
    'X-Proxy-Authorization',
]

// 配置代理中间件
app.use('/proxy', createProxyMiddleware({
    target: 'https://httpbin.org', // 默认目标
    changeOrigin: true,
    xfwd: false,
    secure: true,
    router: (req) => {
        const segments = req.path.split('/').filter(Boolean);
        const service = segments[0];
        const routes = {
            'openai': 'https://api.openai.com',
            'anthropic': 'https://api.anthropic.com',
            'ipinfo': 'https://ipinfo.in',
            'test': 'https://httpbin.org/anything'
        };
        return routes[service] || 'https://httpbin.org';
    },
    pathRewrite: (path, req) => {
        const segments = path.split('/').filter(Boolean);
        
        // 如果是 test 路径，直接返回空路径，因为目标URL已经包含了 /anything
        if (segments[0] === 'test') {
            return '';
        }
        
        // 其他服务的处理逻辑
        if (segments.length <= 1) return '/';
        const newPath = '/' + segments.slice(1).join('/');
        return path.endsWith('/') ? newPath + '/' : newPath;
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            for (const header of Object.keys(proxyReq.getHeaders())) {
                if (removeHeaders.some(h => header.toLowerCase().startsWith(h.toLowerCase()))) {
                    proxyReq.removeHeader(header);
                }
            }
        }
    }
}));

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port);
