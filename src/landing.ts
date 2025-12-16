const landingHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>Translate API</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: grid; place-items: center; min-height: 100vh; background: radial-gradient(circle at 20% 20%, #0ea5e922, transparent 35%), radial-gradient(circle at 80% 0%, #22d3ee22, transparent 30%), radial-gradient(circle at 50% 80%, #22c55e22, transparent 40%); }
    .card { background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); border: 1px solid #e5e7eb55; border-radius: 18px; padding: 28px 32px; box-shadow: 0 20px 60px rgba(15,23,42,0.12); max-width: 520px; text-align: center; }
    h1 { margin: 0 0 12px; font-size: 28px; }
    p { margin: 0 0 14px; color: #4b5563; line-height: 1.6; }
    a { color: #0ea5e9; font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Translate API</h1>
    <p>欢迎使用 Cloudflare Workers 驱动的翻译后端。</p>
    <p>项目主页：<a href="https://github.com/Tokisaki-Galaxy/translate-api" target="_blank" rel="noreferrer">https://github.com/Tokisaki-Galaxy/translate-api</a></p>
  </div>
</body>
</html>`;

export function renderLanding(): Response {
  return new Response(landingHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
