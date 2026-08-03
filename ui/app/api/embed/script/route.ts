import { NextResponse } from "next/server";
import { widgetUrl } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

/**
 * Cache story (the install snippets load this on every customer page): the
 * script only changes when the chatbot's branding changes, so a short
 * browser TTL (1 min) plus a short shared/CDN TTL (5 min) with a full day
 * of stale-while-revalidate keeps repeat loads instant while config edits
 * still reach live sites within ~5 minutes. Any CDN or Amplify/CloudFront
 * edge in front of the app honours these headers for free.
 */
function scriptResponse(body: string, cache = false) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": cache
        ? "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
        : "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * Public: returns the browser bootstrap for a chatbot. Authenticated with
 * `?apiKey=` because a `<script src>` tag cannot send custom headers.
 *
 * The script defines a Web Component (`<datalk-chat>`) that renders the
 * entire chatbot UI inside a Shadow DOM — fully isolated from the host
 * page's styles and scripts.  No iframe, no Tailwind, no external deps.
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
    const backendResponse = await fetch(
      widgetUrl(`config?apiKey=${encodeURIComponent(apiKey)}`),
      {
        method: "GET",
        headers: { "X-Api-Key": apiKey },
        // One minute of dedupe on the *server* — concurrent customer page
        // loads share this fetch, and the route itself is CDN-cached anyway.
        next: { revalidate: 60 },
      } as RequestInit,
    );

    if (!backendResponse.ok) {
      console.warn(
        `[embed] config fetch failed ← ${backendResponse.status} for key ${apiKey.slice(0, 12)}…`,
      );
      return scriptResponse(
        `console.warn(${JSON.stringify(`[Datalk] Chatbot unavailable (HTTP ${backendResponse.status}).`)});`,
      );
    }

    config = toEmbedConfig(
      (await backendResponse.json()) as BackendEmbedConfig,
    );
  } catch (error) {
    console.error("[embed] config fetch error:", error);
    return scriptResponse(
      "console.warn('[Datalk] Unable to reach the chatbot service.');",
    );
  }

  if (!config.isActive) {
    return scriptResponse(
      "console.warn('[Datalk] This chatbot is not active.');",
    );
  }

  // ── Derive visual tokens from the config ──────────────────────────────────
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

  const fontFamilyMap: Record<string, string> = {
    inter:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    roboto:
      "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    geist:
      "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
  const fontFamily =
    fontFamilyMap[config.fontFamily ?? "system"] ??
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // ── Build the standalone Web Component script ─────────────────────────────
  const script = buildWidgetScript({
    apiKey,
    config: {
      id: config.id,
      botName: config.botName,
      botDescription: config.botDescription ?? "",
      welcomeMessage: config.welcomeMessage,
      fallbackMessage: config.fallbackMessage,
      primaryColor: config.primaryColor,
      chatBackground: config.chatBackground ?? "#f8fafc",
      position: config.position,
      launcherLabel: config.launcherLabel,
      avatarInitials: config.avatarInitials,
      suggestedQuestions: config.suggestedQuestions,
      collectVisitorEmail: config.collectVisitorEmail,
      showPoweredBy: config.showPoweredBy ?? true,
      widgetWidth: config.widgetWidth ?? 400,
      widgetHeight: config.widgetHeight ?? 640,
      inputPlaceholder: config.inputPlaceholder ?? "Ask a question...",
      launcherOffset: config.launcherOffset ?? 24,
    },
    launcherRadius,
    panelRadius,
    panelShadow,
    fontFamily,
  });

  return scriptResponse(script, true);
}

// ─── Script builder ─────────────────────────────────────────────────────────

interface WidgetConfig {
  id: string;
  botName: string;
  botDescription: string;
  welcomeMessage: string;
  fallbackMessage: string;
  primaryColor: string;
  chatBackground: string;
  position: string;
  launcherLabel: string;
  avatarInitials: string;
  suggestedQuestions: string[];
  collectVisitorEmail: boolean;
  showPoweredBy: boolean;
  widgetWidth: number;
  widgetHeight: number;
  inputPlaceholder: string;
  launcherOffset: number;
}

interface ScriptParams {
  apiKey: string;
  config: WidgetConfig;
  launcherRadius: string;
  panelRadius: string;
  panelShadow: string;
  fontFamily: string;
}

function buildWidgetScript(p: ScriptParams): string {
  // All dynamic values are safely JSON-stringified so the generated script
  // cannot break out of its string literals.  The `</` → `<\/` replacement
  // prevents a malicious config value from closing the `<script>` tag early.
  const sanitize = (s: string) => s.replace(/<\//g, "<\\/");
  const cfg = sanitize(JSON.stringify(p.config));
  const apiKey = sanitize(JSON.stringify(p.apiKey));
  const launcherRadius = JSON.stringify(p.launcherRadius);
  const panelRadius = JSON.stringify(p.panelRadius);
  const panelShadow = JSON.stringify(p.panelShadow);
  const fontFamily = sanitize(JSON.stringify(p.fontFamily));

  return `/* Datalk Embed Chatbot — Web Component + Shadow DOM */
(function(){
"use strict";
if(window.__datalk_widget_${p.config.id.replace(/[^a-zA-Z0-9]/g, "_")})return;
window.__datalk_widget_${p.config.id.replace(/[^a-zA-Z0-9]/g, "_")}=true;

var CONFIG=${cfg};
var API_KEY=${apiKey};
var LAUNCHER_RADIUS=${launcherRadius};
var PANEL_RADIUS=${panelRadius};
var PANEL_SHADOW=${panelShadow};
var FONT_FAMILY=${fontFamily};

/* Find our own <script> tag — host of the data-* override attributes and
   the origin the API calls go to. document.currentScript is null for async
   scripts, so fall back to a selector. */
function findScriptTag(){
  if(document.currentScript)return document.currentScript;
  return document.querySelector('script[src*="/api/embed/script"]');
}
var SCRIPT_TAG=findScriptTag();
function dataAttr(name){
  try{return SCRIPT_TAG?SCRIPT_TAG.getAttribute(name):null;}catch(e){return null;}
}

/* ── Resolve base URL from the script tag ─────────────────────────────── */
var BASE_URL="";
if(SCRIPT_TAG&&SCRIPT_TAG.src){
  try{BASE_URL=new URL(SCRIPT_TAG.src).origin;}catch(e){}
}

/* Widget geometry: script-tag data-* attributes (from the install snippet,
   hand-editable on the host page) override the backend config, which in
   turn overrides the built-in defaults. Values are clamped to sane bounds. */
var PANEL_WIDTH=parseInt(dataAttr("data-width")||"",10);
if(!(PANEL_WIDTH>0))PANEL_WIDTH=CONFIG.widgetWidth>0?CONFIG.widgetWidth:400;
PANEL_WIDTH=Math.min(560,Math.max(280,PANEL_WIDTH));
var PANEL_HEIGHT=parseInt(dataAttr("data-height")||"",10);
if(!(PANEL_HEIGHT>0))PANEL_HEIGHT=CONFIG.widgetHeight>0?CONFIG.widgetHeight:640;
PANEL_HEIGHT=Math.min(860,Math.max(400,PANEL_HEIGHT));
var EDGE_OFFSET=parseInt(dataAttr("data-offset")||"",10);
if(isNaN(EDGE_OFFSET)||EDGE_OFFSET<0)EDGE_OFFSET=CONFIG.launcherOffset>=0?CONFIG.launcherOffset:24;
EDGE_OFFSET=Math.min(120,Math.max(0,EDGE_OFFSET));
var PH=dataAttr("data-placeholder");
if(PH)CONFIG.inputPlaceholder=PH;
/* 54px launcher + ~10px air gap — matches Intercom-style widgets. */
var PANEL_BOTTOM=EDGE_OFFSET+64;

/* ── Wait for DOM ─────────────────────────────────────────────────────── */
function ready(fn){
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fn);}
  else{fn();}
}

ready(function(){
  /* ── Define custom element ──────────────────────────────────────────── */
  var tagName="datalk-chat";
  if(customElements.get(tagName))return mount(tagName);

  var DatalkChat=(function(){
    function El(){
      var el=Reflect.construct(HTMLElement,[],El);
      el._isOpen=false;
      el._messages=[{role:"assistant",content:CONFIG.welcomeMessage,id:"welcome"}];
      el._threadId=null;
      el._loading=false;
      el._error=null;
      el._feedbackMsg=null;
      el._email="";
      el._emailOpen=false;
      el._launcherHTML=null;
      /* Suggested questions only show before the visitor's first message. */
      el._hasConversation=false;
      return el;
    }
    El.prototype=Object.create(HTMLElement.prototype);
    El.prototype.constructor=El;
    Object.setPrototypeOf(El.prototype,HTMLElement.prototype);
    Object.setPrototypeOf(El,HTMLElement);

    El.prototype.connectedCallback=function(){
      var self=this;
      /* Restore thread from localStorage */
      try{
        var stored=localStorage.getItem("datalk-thread-"+CONFIG.id);
        if(stored)self._threadId=stored;
      }catch(e){}
      self._render();
      self._bind();
    };

    /* ── Render the full UI into Shadow DOM ─────────────────────────── */
    El.prototype._render=function(){
      var side=CONFIG.position==="bottom-left"?"left":"right";
      var self=this;

      var shadow=this.shadowRoot||this.attachShadow({mode:"open"});

      var suggestedHTML="";
      if(CONFIG.suggestedQuestions&&CONFIG.suggestedQuestions.length){
        suggestedHTML='<div class="datalk-suggestions">';
        for(var i=0;i<CONFIG.suggestedQuestions.length;i++){
          suggestedHTML+='<button type="button" class="datalk-suggestion" data-question="'+esc(CONFIG.suggestedQuestions[i])+'">'+esc(CONFIG.suggestedQuestions[i])+'</button>';
        }
        suggestedHTML+='</div>';
      }

      /* Compact inline email row — hidden until the visitor asks for it,
         plus a small toggle in the footer to open it. */
      var emailHTML="";
      var emailToggleHTML="";
      if(CONFIG.collectVisitorEmail){
        emailHTML='<div class="datalk-email-row" style="display:none">'+
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="datalk-email-icon"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="m2.5 5 5.5 3.5L13.5 5"/></svg>'+
          '<input type="email" class="datalk-email-input" placeholder="Your email for follow-up (optional)" aria-label="Your email (optional)" />'+
          '<button type="button" class="datalk-email-close" aria-label="Hide email field">'+
            '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:11px;height:11px"><path d="m4 4 8 8M12 4l-8 8"/></svg>'+
          '</button>'+
        '</div>';
        emailToggleHTML='<button type="button" class="datalk-email-toggle">Add email for follow-up</button>';
      }

      var poweredHTML=CONFIG.showPoweredBy?'<span class="datalk-powered">Powered by <strong>Datalk</strong></span>':"";

      shadow.innerHTML='<style>'+getStyles(CONFIG.primaryColor,CONFIG.chatBackground,LAUNCHER_RADIUS,PANEL_RADIUS,PANEL_SHADOW,FONT_FAMILY,side,PANEL_WIDTH,PANEL_HEIGHT,EDGE_OFFSET,PANEL_BOTTOM)+'</style>'+
        '<div class="datalk-root">'+
          /* Launcher button */
          '<button type="button" class="datalk-launcher" aria-label="'+esc(CONFIG.launcherLabel)+'" aria-expanded="false">'+
            '<span class="datalk-launcher-icon">'+esc(CONFIG.avatarInitials)+'</span>'+
            '<span class="datalk-launcher-text">'+esc(CONFIG.launcherLabel)+'</span>'+
          '</button>'+
          /* Chat panel */
          '<div class="datalk-panel" role="dialog" aria-label="'+esc(CONFIG.botName)+'">'+
            /* Header */
            '<div class="datalk-header">'+
              '<div class="datalk-header-left">'+
                '<div class="datalk-avatar" style="background:'+esc(CONFIG.primaryColor)+'">'+esc(CONFIG.avatarInitials)+'</div>'+
                '<div class="datalk-header-info">'+
                  '<p class="datalk-bot-name">'+esc(CONFIG.botName)+'</p>'+
                  '<p class="datalk-bot-desc">'+(CONFIG.botDescription?esc(CONFIG.botDescription):'Online · answers from documents')+'</p>'+
                '</div>'+
              '</div>'+
              '<button type="button" class="datalk-close-btn" aria-label="Close chat">✕</button>'+
            '</div>'+
            /* Messages area */
            '<div class="datalk-messages" aria-live="polite"></div>'+
            /* Composer */
            '<div class="datalk-composer">'+
              suggestedHTML+
              '<div class="datalk-feedback-area"></div>'+
              emailHTML+
              '<div class="datalk-input-row">'+
                '<textarea class="datalk-input" placeholder="'+esc(CONFIG.inputPlaceholder||"Ask a question...")+'" rows="1"></textarea>'+
                '<button type="button" class="datalk-send-btn" aria-label="Send message" disabled>'+
                  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h14M13 5l5 5-5 5"/></svg>'+
                '</button>'+
              '</div>'+
              '<div class="datalk-footer">'+
                '<span class="datalk-footer-left">'+poweredHTML+emailToggleHTML+'</span>'+
                '<div class="datalk-feedback-btns">'+
                  '<button type="button" class="datalk-feedback-btn" data-reason="not_helpful">Not helpful</button>'+
                  '<button type="button" class="datalk-feedback-btn" data-reason="needs_human">Human help</button>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>';

      this._renderMessages();
    };

    /* ── Render messages ──────────────────────────────────────────────── */
    El.prototype._renderMessages=function(){
      var container=this.shadowRoot.querySelector(".datalk-messages");
      if(!container)return;
      var html="";
      for(var i=0;i<this._messages.length;i++){
        var msg=this._messages[i];
        var isUser=msg.role==="user";
        var cls=isUser?"datalk-msg datalk-msg-user":"datalk-msg datalk-msg-bot";
        html+='<div class="'+(isUser?"datalk-wrap datalk-wrap-user":"datalk-wrap datalk-wrap-bot")+'">'+
          '<div class="'+cls+'">'+esc(msg.content)+'</div>';
        if(msg.sources&&msg.sources.length){
          html+='<div class="datalk-sources">'+
            '<span class="datalk-sources-label">Sources</span>';
          for(var s=0;s<msg.sources.length;s++){
            var src=msg.sources[s];
            html+='<a class="datalk-source-chip" href="'+esc(src.url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(src.title)+'">'+
              '<svg viewBox="0 0 16 16" fill="currentColor" class="datalk-source-icon" aria-hidden="true"><path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/><path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/></svg>'+
              esc(src.label)+'</a>';
          }
          html+='</div>';
        }
        html+='</div>';
      }
      if(this._loading){
        html+='<div class="datalk-wrap datalk-wrap-bot"><div class="datalk-msg datalk-msg-bot datalk-typing"><span></span><span></span><span></span></div></div>';
      }
      container.innerHTML=html;
      container.scrollTop=container.scrollHeight;
    };

    /* ── Bind event handlers ──────────────────────────────────────────── */
    El.prototype._bind=function(){
      var self=this;
      var root=this.shadowRoot;

      /* Launcher toggle */
      var launcher=root.querySelector(".datalk-launcher");
      launcher.addEventListener("click",function(){self._toggle();});

      /* Close button */
      var closeBtn=root.querySelector(".datalk-close-btn");
      closeBtn.addEventListener("click",function(){self._close();});

      /* Text input */
      var input=root.querySelector(".datalk-input");
      input.addEventListener("input",function(){
        autoGrow(input);
        var sendBtn=root.querySelector(".datalk-send-btn");
        sendBtn.disabled=!input.value.trim()||self._loading;
      });
      input.addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){
          e.preventDefault();
          self._sendCurrent();
        }
      });

      /* Send button */
      var sendBtn=root.querySelector(".datalk-send-btn");
      sendBtn.addEventListener("click",function(){self._sendCurrent();});

      /* Suggested questions */
      var suggestions=root.querySelectorAll(".datalk-suggestion");
      for(var i=0;i<suggestions.length;i++){
        suggestions[i].addEventListener("click",function(){
          var q=this.getAttribute("data-question");
          if(q)self._sendMessage(q);
        });
      }

      /* Email row + footer toggle */
      var emailInput=root.querySelector(".datalk-email-input");
      if(emailInput){
        emailInput.addEventListener("input",function(){
          self._email=emailInput.value;
        });
      }
      var emailToggle=root.querySelector(".datalk-email-toggle");
      if(emailToggle){
        emailToggle.addEventListener("click",function(){
          self._emailOpen=true;
          self._syncEmailUI();
          var row=root.querySelector(".datalk-email-input");
          if(row)row.focus();
        });
      }
      var emailClose=root.querySelector(".datalk-email-close");
      if(emailClose){
        emailClose.addEventListener("click",function(){
          self._emailOpen=false;
          self._syncEmailUI();
        });
      }

      /* Feedback buttons */
      var feedbackBtns=root.querySelectorAll(".datalk-feedback-btn");
      for(var j=0;j<feedbackBtns.length;j++){
        feedbackBtns[j].addEventListener("click",function(){
          var reason=this.getAttribute("data-reason");
          if(reason)self._submitFeedback(reason);
        });
      }
    };

    /* ── Email UI state ───────────────────────────────────────────────── */
    El.prototype._syncEmailUI=function(){
      var row=this.shadowRoot.querySelector(".datalk-email-row");
      var toggle=this.shadowRoot.querySelector(".datalk-email-toggle");
      if(!row||!toggle)return;
      if(this._emailOpen){
        row.style.display="flex";
        toggle.style.display="none";
        return;
      }
      row.style.display="none";
      toggle.style.display="";
      if(this._email&&this._email.trim()){
        toggle.className="datalk-email-toggle datalk-email-saved";
        toggle.innerHTML='<svg viewBox="0 0 16 16" fill="currentColor" style="width:10px;height:10px;flex-shrink:0"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg><span>'+esc(this._email)+'</span>';
      }else{
        toggle.className="datalk-email-toggle";
        toggle.textContent="Add email for follow-up";
      }
    };

    /* ── Toggle / open / close ────────────────────────────────────────── */
    El.prototype._toggle=function(){
      if(this._isOpen)this._close();else this._open();
    };
    El.prototype._open=function(){
      this._isOpen=true;
      var root=this.shadowRoot;
      root.querySelector(".datalk-panel").classList.add("datalk-panel-open");
      /* The launcher stays put and becomes the close button — the standard
         Intercom/Drift pattern, so no empty margin appears under the panel. */
      var launcher=root.querySelector(".datalk-launcher");
      if(this._launcherHTML==null)this._launcherHTML=launcher.innerHTML;
      launcher.classList.add("datalk-launcher-close");
      launcher.setAttribute("aria-label","Close chat");
      launcher.setAttribute("aria-expanded","true");
      launcher.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="datalk-close-x"><path d="m5.5 5.5 9 9M14.5 5.5l-9 9"/></svg>';
      var input=root.querySelector(".datalk-input");
      if(input)input.focus();
    };
    El.prototype._close=function(){
      this._isOpen=false;
      var root=this.shadowRoot;
      root.querySelector(".datalk-panel").classList.remove("datalk-panel-open");
      var launcher=root.querySelector(".datalk-launcher");
      launcher.classList.remove("datalk-launcher-close");
      launcher.setAttribute("aria-label",CONFIG.launcherLabel);
      launcher.setAttribute("aria-expanded","false");
      if(this._launcherHTML!=null)launcher.innerHTML=this._launcherHTML;
    };

    /* ── Hide conversation starters after the first user message ──────── */
    El.prototype._hideSuggestions=function(){
      this._hasConversation=true;
      var block=this.shadowRoot.querySelector(".datalk-suggestions");
      if(block)block.style.display="none";
    };

    /* ── Send message ─────────────────────────────────────────────────── */
    El.prototype._sendCurrent=function(){
      var input=this.shadowRoot.querySelector(".datalk-input");
      var text=input.value.trim();
      if(!text||this._loading)return;
      input.value="";
      autoGrow(input);
      this._sendMessage(text);
    };

    El.prototype._sendMessage=function(text){
      var self=this;
      self._error=null;
      self._feedbackMsg=null;
      self._loading=true;
      self._hideSuggestions();
      self._messages.push({role:"user",content:text,id:"u-"+Date.now()});
      self._renderMessages();
      self._updateSendBtn();

      fetch(BASE_URL+"/api/embed/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json","X-Api-Key":API_KEY},
        body:JSON.stringify({
          message:text,
          thread_id:self._threadId||undefined,
          visitor_email:self._email||undefined,
          page_url:window.location.href
        })
      }).then(function(res){
        if(!res.ok){
          return res.json().catch(function(){return{detail:"Request failed"};}).then(function(data){
            throw new Error(data.detail||"Request failed");
          });
        }
        return res.json();
      }).then(function(data){
        self._loading=false;
        self._threadId=data.thread_id;
        try{localStorage.setItem("datalk-thread-"+CONFIG.id,data.thread_id);}catch(e){}
        self._messages.push({
          role:"assistant",
          content:data.final_response,
          sources:normalizeSources(data.source_documents),
          id:"a-"+Date.now()
        });
        self._renderMessages();
        self._updateSendBtn();
      }).catch(function(err){
        self._loading=false;
        self._error=err.message||"Something went wrong.";
        self._messages.push({role:"assistant",content:CONFIG.fallbackMessage,id:"f-"+Date.now()});
        self._renderMessages();
        self._updateSendBtn();
        self._showError();
      });
    };

    /* ── Feedback ─────────────────────────────────────────────────────── */
    El.prototype._submitFeedback=function(reason){
      var self=this;
      var lastUser=null;
      for(var i=self._messages.length-1;i>=0;i--){
        if(self._messages[i].role==="user"){lastUser=self._messages[i];break;}
      }
      if(!lastUser)return;

      var lastAssistant=null;
      for(var j=self._messages.length-1;j>=0;j--){
        if(self._messages[j].role==="assistant"){lastAssistant=self._messages[j];break;}
      }

      fetch(BASE_URL+"/api/embed/feedback",{
        method:"POST",
        headers:{"Content-Type":"application/json","X-Api-Key":API_KEY},
        body:JSON.stringify({
          threadId:self._threadId,
          question:lastUser.content,
          answer:lastAssistant?lastAssistant.content:null,
          visitorEmail:self._email||undefined,
          pageUrl:window.location.href,
          parentOrigin:window.location.origin,
          reason:reason
        })
      }).then(function(res){
        if(res.ok){
          self._feedbackMsg="Thanks — this was added to the knowledge gap inbox.";
        }else{
          self._feedbackMsg="Could not submit feedback.";
        }
        self._showFeedback();
      }).catch(function(){
        self._feedbackMsg="Could not submit feedback.";
        self._showFeedback();
      });
    };

    /* ── UI helpers ───────────────────────────────────────────────────── */
    El.prototype._updateSendBtn=function(){
      var input=this.shadowRoot.querySelector(".datalk-input");
      var sendBtn=this.shadowRoot.querySelector(".datalk-send-btn");
      if(input&&sendBtn){
        sendBtn.disabled=!input.value.trim()||this._loading;
      }
    };

    El.prototype._showError=function(){
      var area=this.shadowRoot.querySelector(".datalk-feedback-area");
      if(!area||!this._error)return;
      area.innerHTML='<p class="datalk-error-msg">'+esc(this._error)+'</p>';
      var self=this;
      setTimeout(function(){area.innerHTML="";self._error=null;},5000);
    };

    El.prototype._showFeedback=function(){
      var area=this.shadowRoot.querySelector(".datalk-feedback-area");
      if(!area)return;
      var cls=this._feedbackMsg&&this._feedbackMsg.indexOf("Thanks")===0?"datalk-success-msg":"datalk-error-msg";
      area.innerHTML='<p class="'+cls+'">'+esc(this._feedbackMsg||"")+'</p>';
      setTimeout(function(){area.innerHTML="";},5000);
    };

    return El;
  })();

  /* Register the custom element */
  try{customElements.define(tagName,DatalkChat);}catch(e){
    document.registerElement(tagName,{prototype:DatalkChat.prototype});
  }

  function mount(name){
    if(document.querySelector(tagName))return;
    var el=document.createElement(tagName);
    document.body.appendChild(el);
  }

  mount(tagName);
});

/* ── Utility: auto-grow textarea ─────────────────────────────────────── */
function autoGrow(el){
  el.style.height="auto";
  el.style.height=Math.min(el.scrollHeight,120)+"px";
}

/* ── Utility: HTML-escape ────────────────────────────────────────────── */
function esc(s){
  if(!s)return"";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Source-document normalisation ───────────────────────────────────── */
/* The backend wraps every source in nested markdown links with HTML-escaped
   ampersands. These unwrap the mess into clean {url,label,title} chips. */
function decEntities(s){
  var out=String(s);
  for(var i=0;i<4;i++){
    var next=out.replace(/&amp;amp;/g,"&").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    if(next===out)break;
    out=next;
  }
  return out;
}
function extractUrl(raw){
  if(!raw)return null;
  var m=String(raw).match(/https?:\\/\\/[^\\s)\\]"'<>]+/);
  if(!m)return null;
  return decEntities(m[0].replace(/[)\\].,;]+$/,""));
}
function isUuidName(name){
  var stem=String(name).replace(/\\.[a-z0-9]{1,5}$/i,"");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stem);
}
function normalizeSources(raw){
  if(!raw||!raw.length)return[];
  var out=[];
  var seen={};
  for(var i=0;i<raw.length;i++){
    if(typeof raw[i]!=="string")continue;
    var url=extractUrl(raw[i]);
    if(!url||seen[url])continue;
    seen[url]=true;
    var name=null;
    try{
      var parts=url.split("?")[0].split("#")[0].split("/").filter(Boolean);
      var last=parts.length?decodeURIComponent(parts[parts.length-1]):"";
      if(last&&!isUuidName(last))name=last;
    }catch(e){}
    var label=name?(name.length>26?name.slice(0,25)+"\\u2026":name):("Source "+(out.length+1));
    out.push({url:url,label:label,title:name||("Source document "+(out.length+1))});
  }
  return out;
}

/* ── CSS styles (all scoped inside Shadow DOM) ────────────────────────── */
function getStyles(primary,bg,lRadius,pRadius,pShadow,font,side,panelW,panelH,edgeOff,panelBottom){
  return [
  ':host{all:initial;display:block;font-family:'+font+';font-size:14px;line-height:1.5;color:#1e293b;}',
  '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}',
  /* Launcher */
  '.datalk-launcher{position:fixed;bottom:'+edgeOff+'px;'+side+':'+edgeOff+'px;z-index:2147483646;border:none;border-radius:'+lRadius+';background:'+primary+';color:#fff;box-shadow:0 12px 40px rgba(15,23,42,.22);font:600 14px '+font+';padding:12px 18px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:transform .2s,box-shadow .2s;}',
  '.datalk-launcher:hover{transform:translateY(-2px);box-shadow:0 16px 50px rgba(15,23,42,.28);}',
  '.datalk-launcher:focus{outline:3px solid rgba(59,130,246,.4);outline-offset:3px;}',
  '.datalk-launcher-icon{width:30px;height:30px;border-radius:999px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}',
  '.datalk-launcher-text{white-space:nowrap;}',
  '.datalk-launcher.datalk-launcher-close{width:54px;height:54px;padding:0;justify-content:center;}',
  '.datalk-launcher.datalk-launcher-close .datalk-close-x{width:20px;height:20px;}',
  /* Panel */
  '.datalk-panel{position:fixed;bottom:'+panelBottom+'px;'+side+':'+edgeOff+'px;z-index:2147483647;width:min('+panelW+'px,calc(100vw - 32px));height:min('+panelH+'px,calc(100vh - 120px));border:1px solid rgba(15,23,42,.08);border-radius:'+pRadius+';overflow:hidden;box-shadow:'+pShadow+';background:#fff;display:flex;flex-direction:column;opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}',
  '.datalk-panel.datalk-panel-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
  /* Header */
  '.datalk-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#fff;flex-shrink:0;}',
  '.datalk-header-left{display:flex;align-items:center;gap:10px;min-width:0;}',
  '.datalk-avatar{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;}',
  '.datalk-header-info{min-width:0;}',
  '.datalk-bot-name{font-size:14px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.datalk-bot-desc{font-size:11px;color:#94a3b8;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.datalk-close-btn{background:none;border:none;font-size:16px;color:#94a3b8;cursor:pointer;padding:6px;border-radius:8px;line-height:1;transition:background .15s,color .15s;}',
  '.datalk-close-btn:hover{background:#f1f5f9;color:#475569;}',
  /* Messages */
  '.datalk-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:'+bg+';-webkit-overflow-scrolling:touch;}',
  '.datalk-wrap{display:flex;flex-direction:column;gap:6px;max-width:85%;}',
  '.datalk-wrap-user{align-self:flex-end;align-items:flex-end;}',
  '.datalk-wrap-bot{align-self:flex-start;align-items:flex-start;}',
  '.datalk-msg{width:100%;padding:10px 14px;font-size:13.5px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap;}',
  '.datalk-msg-user{border-radius:16px 16px 4px 16px;background:'+primary+';color:#fff;}',
  '.datalk-msg-bot{border-radius:16px 16px 16px 4px;background:#fff;border:1px solid #e2e8f0;color:#334155;box-shadow:0 1px 3px rgba(0,0,0,.04);}',
  /* Source chips */
  '.datalk-sources{display:flex;flex-wrap:wrap;align-items:center;gap:4px;width:100%;}',
  '.datalk-sources-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;}',
  '.datalk-source-chip{display:inline-flex;align-items:center;gap:4px;max-width:170px;border:1px solid #e2e8f0;background:#fff;border-radius:7px;padding:3px 8px;font-size:11px;font-weight:500;color:#64748b;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:border-color .15s,color .15s,background .15s;}',
  '.datalk-source-chip:hover{border-color:#cbd5e1;background:#f8fafc;color:#0f172a;}',
  '.datalk-source-icon{width:10px;height:10px;color:#94a3b8;flex-shrink:0;}',
  /* Typing indicator */
  '.datalk-typing{display:flex!important;align-items:center;gap:4px;width:auto!important;padding:12px 16px!important;}',
  '.datalk-typing span{width:6px;height:6px;border-radius:50%;background:#94a3b8;display:block;animation:datalk-bounce .6s infinite alternate;}',
  '.datalk-typing span:nth-child(2){animation-delay:.2s;}',
  '.datalk-typing span:nth-child(3){animation-delay:.4s;}',
  '@keyframes datalk-bounce{0%{opacity:.3;transform:translateY(0);}100%{opacity:1;transform:translateY(-4px);}}',
  /* Suggestions */
  '.datalk-suggestions{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}',
  '.datalk-suggestion{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:5px 12px;font-size:12px;color:#475569;cursor:pointer;transition:background .15s,border-color .15s;font-family:'+font+';}',
  '.datalk-suggestion:hover{background:#f8fafc;border-color:#cbd5e1;}',
  /* Composer */
  '.datalk-composer{border-top:1px solid #f1f5f9;padding:12px 16px;background:#fff;flex-shrink:0;}',
  /* Compact email row */
  '.datalk-email-row{display:flex;align-items:center;gap:6px;height:32px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:0 8px;margin-bottom:8px;transition:border-color .15s;}',
  '.datalk-email-row:focus-within{border-color:'+primary+';}',
  '.datalk-email-icon{width:12px;height:12px;color:#94a3b8;flex-shrink:0;}',
  '.datalk-email-input{flex:1;min-width:0;border:none;background:transparent;height:100%;font-size:12px;font-family:'+font+';color:#334155;outline:none;padding:0;}',
  '.datalk-email-input::placeholder{color:#94a3b8;}',
  '.datalk-email-close{background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px;border-radius:4px;display:flex;align-items:center;line-height:1;}',
  '.datalk-email-close:hover{color:#475569;}',
  '.datalk-input-row{display:flex;align-items:flex-end;gap:8px;}',
  '.datalk-input{flex:1;border:1px solid #e2e8f0;border-radius:14px;padding:10px 14px;font-size:13.5px;font-family:'+font+';resize:none;outline:none;min-height:40px;max-height:120px;line-height:1.45;transition:border-color .15s;}',
  '.datalk-input:focus{border-color:'+primary+';}',
  '.datalk-send-btn{width:38px;height:38px;border:none;border-radius:12px;background:'+primary+';color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}',
  '.datalk-send-btn:disabled{opacity:.4;cursor:not-allowed;}',
  '.datalk-send-btn svg{width:16px;height:16px;}',
  /* Footer */
  '.datalk-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px;}',
  '.datalk-footer-left{display:flex;align-items:center;gap:8px;min-width:0;}',
  '.datalk-powered{font-size:11px;color:#94a3b8;white-space:nowrap;}',
  '.datalk-powered strong{font-weight:600;}',
  '.datalk-email-toggle{background:none;border:none;font-size:11px;color:#64748b;cursor:pointer;text-decoration:underline;text-underline-offset:2px;text-decoration-color:#cbd5e1;padding:0;font-family:'+font+';white-space:nowrap;transition:color .15s;}',
  '.datalk-email-toggle:hover{color:#0f172a;}',
  '.datalk-email-toggle.datalk-email-saved{color:#059669;text-decoration:none;display:inline-flex;align-items:center;gap:3px;max-width:150px;white-space:normal;}',
  '.datalk-email-toggle.datalk-email-saved:hover{color:#047857;}',
  '.datalk-email-toggle.datalk-email-saved span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
  '.datalk-feedback-btns{display:flex;gap:8px;flex-shrink:0;}',
  '.datalk-feedback-btn{background:none;border:none;font-size:11px;color:#94a3b8;cursor:pointer;padding:2px 0;font-family:'+font+';transition:color .15s;}',
  '.datalk-feedback-btn:hover{color:#475569;}',
  /* Feedback / error messages */
  '.datalk-feedback-area{min-height:0;}',
  '.datalk-error-msg{font-size:12px;color:#dc2626;margin-bottom:6px;}',
  '.datalk-success-msg{font-size:12px;color:#16a34a;margin-bottom:6px;}',
  /* Mobile */
  '@media(max-width:520px){',
    '.datalk-panel{bottom:0;left:0;right:0;width:100vw;height:100dvh;border-radius:0;border:none;}',
    '.datalk-launcher{bottom:18px;'+side+':18px;}',
  '}'
  ].join("\\n");
}
})();`;
}
