import { NextResponse } from "next/server";
import { getEmbedConfig } from "@/lib/embed-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const botId = url.searchParams.get("botId");
  if (!botId) {
    return new NextResponse(
      "console.warn('Missing botId for RAG chatbot embed.');",
      {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      },
    );
  }

  const config = await getEmbedConfig(botId);
  if (!config?.isActive) {
    return new NextResponse(
      "console.warn('RAG chatbot embed is not available for this website.');",
      {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      },
    );
  }

  const primaryColor = JSON.stringify(config.primaryColor);
  const launcherLabel = JSON.stringify(config.launcherLabel);
  const position = JSON.stringify(config.position);
  const avatarInitials = JSON.stringify(config.avatarInitials);
  const botIdJson = JSON.stringify(config.id);

  const script = `
(function () {
  if (window.__ragSaasChatbotLoaded_${config.id.replaceAll("-", "_")}) return;
  window.__ragSaasChatbotLoaded_${config.id.replaceAll("-", "_")} = true;

  var script = document.currentScript;
  var baseUrl = new URL(script.src).origin;
  var botId = ${botIdJson};
  var primaryColor = ${primaryColor};
  var launcherLabel = ${launcherLabel};
  var position = ${position};
  var avatarInitials = ${avatarInitials};
  var side = position === 'bottom-left' ? 'left' : 'right';

  var style = document.createElement('style');
  style.textContent = '.rag-saas-launcher{position:fixed;bottom:24px;' + side + ':24px;z-index:2147483646;border:0;border-radius:999px;background:' + primaryColor + ';color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.24);font:600 14px system-ui,-apple-system,Segoe UI,sans-serif;padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer}.rag-saas-launcher:focus{outline:3px solid rgba(59,130,246,.35);outline-offset:3px}.rag-saas-dot{width:30px;height:30px;border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:12px}.rag-saas-panel{position:fixed;bottom:86px;' + side + ':24px;z-index:2147483647;width:min(390px,calc(100vw - 32px));height:min(640px,calc(100vh - 112px));border:1px solid rgba(15,23,42,.12);border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(15,23,42,.28);background:#fff;display:none}.rag-saas-panel iframe{width:100%;height:100%;border:0;display:block}@media(max-width:520px){.rag-saas-panel{bottom:0;right:0;left:0;width:100vw;height:100dvh;border-radius:0}.rag-saas-launcher{bottom:18px;' + side + ':18px}}';
  document.head.appendChild(style);

  var launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'rag-saas-launcher';
  launcher.setAttribute('aria-label', launcherLabel);
  launcher.innerHTML = '<span class="rag-saas-dot">' + avatarInitials + '</span><span>' + launcherLabel + '</span>';

  var panel = document.createElement('div');
  panel.className = 'rag-saas-panel';
  var iframe = document.createElement('iframe');
  iframe.title = launcherLabel;
  iframe.loading = 'lazy';
  iframe.allow = 'clipboard-write';
  iframe.src = baseUrl + '/widget/' + encodeURIComponent(botId) + '?parentOrigin=' + encodeURIComponent(window.location.origin) + '&pageUrl=' + encodeURIComponent(window.location.href);
  panel.appendChild(iframe);

  launcher.addEventListener('click', function () {
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  });

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'rag-saas-close') return;
    panel.style.display = 'none';
  });

  document.body.appendChild(panel);
  document.body.appendChild(launcher);
})();`;

  return new NextResponse(script, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}
