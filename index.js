const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// LINK ATUALIZADO DO PINGGY
const DESTINO = 'http://wofka-164-163-214-220.a.free.pinggy.link'; 

app.use('/', createProxyMiddleware({ 
    target: DESTINO, 
    changeOrigin: true,
    ws: true, // Habilita suporte a WebSockets (melhora estabilidade)
    onProxyReq: (proxyReq) => {
        proxyReq.setHeader('x-pinggy-no-screen', 'true');
    },
    onProxyRes: (proxyRes) => {
        // Bypass de MIME: Força o Windows a tratar como executável
        proxyRes.headers['content-type'] = 'application/octet-stream';
        proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
    },
    onError: (err, req, res) => {
        console.error('Erro no Proxy:', err);
        res.status(500).send('Reconectando túnel...');
    }
}));

// Porta automática do Render ou 3000 local
const server = app.listen(process.env.PORT || 3000);
server.keepAliveTimeout = 60000; // Mantém a conexão aberta por 60s
