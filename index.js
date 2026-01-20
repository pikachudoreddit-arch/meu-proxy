const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const URL = 'https://wofka-164-163-214-220.a.free.pinggy.link:443'; // << fixo

app.use('/t', createProxyMiddleware({
  target: URL,
  changeOrigin: true,
  ws: true,
  onProxyReq: p => p.setHeader('x-pinggy-no-screen','true')
}));

app.get('/health', (_,r)=>r.send('OK'));
app.listen(process.env.PORT||3000);
