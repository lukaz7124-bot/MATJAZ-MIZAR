// -----------------------------------------------------------------------
// Preprost statični strežnik SAMO za lokalni predogled.
// Te datoteke NE nalagaj na spletni strežnik — objavljena stran je statična.
// Zagon:  node server.js   ->   http://localhost:4173
// Parameter ?nomotion=1 začasno izklopi upoštevanje prefers-reduced-motion,
// da se animacije vidijo tudi, kadar ima Windows izklopljene učinke animacije.
// -----------------------------------------------------------------------
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const root = __dirname, port = 4173;
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.xml':'application/xml',
  '.txt':'text/plain; charset=utf-8', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(url.parse(req.url).pathname);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403).end('403'); return; }
  const nomotion = /nomotion=1/.test(req.url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}).end('404: ' + p); return; }
    const ext = path.extname(file).toLowerCase();
    let out = data;
    // Samo za lokalno testiranje: ?nomotion=1 izklopi upoštevanje prefers-reduced-motion,
    // ker ima ta računalnik v Windows izklopljene animacije.
    if (nomotion && ext === '.css') {
      const t = data.toString('utf8');
      const i = t.indexOf('@media (prefers-reduced-motion: reduce)');
      out = Buffer.from(i > -1 ? t.slice(0, i) : t, 'utf8');
    }
    if (nomotion && ext === '.html') {
      out = Buffer.from(data.toString('utf8').replace('</head>',
        '<script>(function(){var r=window.matchMedia.bind(window);window.matchMedia=function(q){return /prefers-reduced-motion/.test(q)?{matches:false,media:q,onchange:null,addEventListener:function(){},removeEventListener:function(){},addListener:function(){},removeListener:function(){},dispatchEvent:function(){return false}}:r(q)};})();</script></head>')
        .replace(/(styles.css)"/, '$1?nomotion=1&b='+Date.now()+'"').replace(/(main.js)"/, '$1?b='+Date.now()+'"'), 'utf8');
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(out);
  });
}).listen(port, () => console.log('Predogled teče na http://localhost:' + port));
