import { NextResponse } from "next/server";
import { embedUrl, readBackendError } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

function scriptResponse(body: string, cache = false) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": cache ? "public, max-age=60" : "no-store",
    },
  });
}

/**
 * Public: returns the browser bootstrap for a chatbot. Authenticated with
 * `?apiKey=` because a `<script src>` tag cannot send custom headers.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey");

  if (!apiKey) {
    return scriptResponse(
      "console.warn('[Datalk] Missing apiKey on the chatbot embed script.');",
    );
  }

  let config: ReturnType<typeof toEmbedConfig>;
  try {
    const backendResponse = await fetch(embedUrl("/config"), {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const detail = await readBackendError(backendResponse);
      return scriptResponse(
        `console.warn(${JSON.stringify(`[Datalk] Chatbot unavailable: ${detail}`)});`,
      );
    }

    config = toEmbedConfig(
      (await backendResponse.json()) as BackendEmbedConfig,
    );
  } catch {
    return scriptResponse(
      "console.warn('[Datalk] Unable to reach the chatbot service.');",
    );
  }

  if (!config.isActive) {
    return scriptResponse(
      "console.warn('[Datalk] This chatbot is not active.');",
    );
  }

  const instanceKey = config.id.replaceAll("-", "_");
  const launcherRadius =
    config.launcherStyle === "square"
      ? "8px"
      : config.launcherStyle === "rounded"
        ? "14px"
        : "999px";
  const panelRadius =
    config.borderRadiusStyle === "square"
      ? "0px"
      : config.borderRadiusStyle === "very-rounded"
        ? "32px"
        : "24px";
  const panelShadow =
    config.widgetShadow === "none"
      ? "none"
      : config.widgetShadow === "strong"
        ? "0 32px 90px rgba(15,23,42,.42)"
        : "0 24px 80px rgba(15,23,42,.28)";

  const script = `
(function () {
  if (window.__datalkChatbot_${instanceKey}) return;
  window.__datalkChatbot_${instanceKey} = true;

  var script = document.currentScript;
  var baseUrl = new URL(script.src).origin;
  var apiKey = ${JSON.stringify(apiKey)};
  var primaryColor = ${JSON.stringify(config.primaryColor)};
  var launcherLabel = ${JSON.stringify(config.launcherLabel)};
  var avatarInitials = ${JSON.stringify(config.avatarInitials)};
  var side = ${JSON.stringify(config.position)} === 'bottom-left' ? 'left' : 'right';
  var launcherRadius = ${JSON.stringify(launcherRadius)};
  var panelRadius = ${JSON.stringify(panelRadius)};
  var panelShadow = ${JSON.stringify(panelShadow)};

  var style = document.createElement('style');
  style.textContent = '.datalk-launcher{position:fixed;bottom:24px;' + side + ':24px;z-index:2147483646;border:0;border-radius:' + launcherRadius + ';background:' + primaryColor + ';color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.24);font:600 14px system-ui,-apple-system,Segoe UI,sans-serif;padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer}.datalk-launcher:focus{outline:3px solid rgba(59,130,246,.35);outline-offset:3px}.datalk-dot{width:30px;height:30px;border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:12px}.datalk-panel{position:fixed;bottom:86px;' + side + ':24px;z-index:2147483647;width:min(390px,calc(100vw - 32px));height:min(640px,calc(100vh - 112px));border:1px solid rgba(15,23,42,.12);border-radius:' + panelRadius + ';overflow:hidden;box-shadow:' + panelShadow + ';background:#fff;display:none}.datalk-panel iframe{width:100%;height:100%;border:0;display:block}@media(max-width:520px){.datalk-panel{bottom:0;right:0;left:0;width:100vw;height:100dvh;border-radius:0}.datalk-launcher{bottom:18px;' + side + ':18px}}';
  document.head.appendChild(style);

  var launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'datalk-launcher';
  launcher.setAttribute('aria-label', launcherLabel);
  launcher.innerHTML = '<span class="datalk-dot"></span><span></span>';
  launcher.firstChild.textContent = avatarInitials;
  launcher.lastChild.textContent = launcherLabel;

  var panel = document.createElement('div');
  panel.className = 'datalk-panel';

  var iframe = document.createElement('iframe');
  iframe.title = launcherLabel;
  iframe.loading = 'lazy';
  iframe.allow = 'clipboard-write';
  iframe.src = baseUrl + '/widget?apiKey=' + encodeURIComponent(apiKey)
    + '&parentOrigin=' + encodeURIComponent(window.location.origin)
    + '&pageUrl=' + encodeURIComponent(window.location.href);
  panel.appendChild(iframe);

  launcher.addEventListener('click', function () {
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  });

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'datalk-close') return;
    panel.style.display = 'none';
  });

  document.body.appendChild(panel);
  document.body.appendChild(launcher);
})();`;

  return scriptResponse(script, true);
}
