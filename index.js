const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 配置代理中间件
app.use('/proxy', createProxyMiddleware({
    target: 'https://ipinfo.in',
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '',
    },
}));

// 监听端口（Vercel会自动分配端口）
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});