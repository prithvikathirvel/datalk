import { NextResponse } from "next/server";
import { widgetUrl } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

function scriptResponse(body: string, cache = false) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": cache ? "public, max-age=60" : "no-store",
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
        cache: "no-store",
      },
    );

    console.log(
      `[embed] fetch → GET ${widgetUrl(`config?apiKey=${encodeURIComponent(apiKey)}`)} (apiKey=${apiKey})`,
    );
    console.log(
      `[embed] response ← ${backendResponse.status} ${widgetUrl(`config?apiKey=${encodeURIComponent(apiKey)}`)}`,
    );

    const responseText = await backendResponse.text();
    console.log(`[embed] response body ← ${responseText}`);

    if (!backendResponse.ok) {
      return scriptResponse(
        `console.warn(${JSON.stringify(`[Datalk] Chatbot unavailable: ${responseText}`)});`,
      );
    }

    config = toEmbedConfig(JSON.parse(responseText) as BackendEmbedConfig);
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

/* ── Resolve base URL from the script tag ─────────────────────────────── */
var currentScript=document.currentScript;
var BASE_URL="";
if(currentScript&&currentScript.src){
  try{BASE_URL=new URL(currentScript.src).origin;}catch(e){}
}
if(!BASE_URL){
  var fallback=document.querySelector('script[src*="/api/embed/script"]');
  if(fallback){try{BASE_URL=new URL(fallback.src).origin;}catch(e){}}
}

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

      var emailHTML="";
      if(CONFIG.collectVisitorEmail){
        emailHTML='<input type="email" class="datalk-email-input" placeholder="Your email (optional)" />';
      }

      var poweredHTML=CONFIG.showPoweredBy?'<span class="datalk-powered">Powered by <strong>Datalk</strong></span>':'<span></span>';

      shadow.innerHTML='<style>'+getStyles(CONFIG.primaryColor,CONFIG.chatBackground,LAUNCHER_RADIUS,PANEL_RADIUS,PANEL_SHADOW,FONT_FAMILY,side)+'</style>'+
        '<div class="datalk-root">'+
          /* Launcher button */
          '<button type="button" class="datalk-launcher" aria-label="'+esc(CONFIG.launcherLabel)+'">'+
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
                '<textarea class="datalk-input" placeholder="Ask a question..." rows="1"></textarea>'+
                '<button type="button" class="datalk-send-btn" aria-label="Send message" disabled>'+
                  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h14M13 5l5 5-5 5"/></svg>'+
                '</button>'+
              '</div>'+
              '<div class="datalk-footer">'+
                poweredHTML+
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
        var cls=msg.role==="user"?"datalk-msg datalk-msg-user":"datalk-msg datalk-msg-bot";
        html+='<div class="'+cls+'">'+esc(msg.content)+'</div>';
      }
      if(this._loading){
        html+='<div class="datalk-msg datalk-msg-bot datalk-typing"><span></span><span></span><span></span></div>';
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

      /* Email input */
      var emailInput=root.querySelector(".datalk-email-input");
      if(emailInput){
        emailInput.addEventListener("input",function(){
          self._email=emailInput.value;
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

    /* ── Toggle / open / close ────────────────────────────────────────── */
    El.prototype._toggle=function(){
      if(this._isOpen)this._close();else this._open();
    };
    El.prototype._open=function(){
      this._isOpen=true;
      var root=this.shadowRoot;
      root.querySelector(".datalk-panel").classList.add("datalk-panel-open");
      root.querySelector(".datalk-launcher").style.display="none";
      var input=root.querySelector(".datalk-input");
      if(input)input.focus();
    };
    El.prototype._close=function(){
      this._isOpen=false;
      var root=this.shadowRoot;
      root.querySelector(".datalk-panel").classList.remove("datalk-panel-open");
      root.querySelector(".datalk-launcher").style.display="";
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
        self._messages.push({role:"assistant",content:data.final_response,id:"a-"+Date.now()});
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
      var self=this;
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

/* ── CSS styles (all scoped inside Shadow DOM) ────────────────────────── */
function getStyles(primary,bg,lRadius,pRadius,pShadow,font,side){
  return [
  ':host{all:initial;display:block;font-family:'+font+';font-size:14px;line-height:1.5;color:#1e293b;}',
  '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}',
  /* Launcher */
  '.datalk-launcher{position:fixed;bottom:24px;'+side+':24px;z-index:2147483646;border:none;border-radius:'+lRadius+';background:'+primary+';color:#fff;box-shadow:0 12px 40px rgba(15,23,42,.22);font:600 14px '+font+';padding:12px 18px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:transform .2s,box-shadow .2s;}',
  '.datalk-launcher:hover{transform:translateY(-2px);box-shadow:0 16px 50px rgba(15,23,42,.28);}',
  '.datalk-launcher:focus{outline:3px solid rgba(59,130,246,.4);outline-offset:3px;}',
  '.datalk-launcher-icon{width:30px;height:30px;border-radius:999px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}',
  '.datalk-launcher-text{white-space:nowrap;}',
  /* Panel */
  '.datalk-panel{position:fixed;bottom:90px;'+side+':24px;z-index:2147483647;width:min(400px,calc(100vw - 32px));height:min(640px,calc(100vh - 120px));border:1px solid rgba(15,23,42,.08);border-radius:'+pRadius+';overflow:hidden;box-shadow:'+pShadow+';background:#fff;display:flex;flex-direction:column;opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}',
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
  '.datalk-msg{max-width:85%;padding:10px 14px;font-size:13.5px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap;}',
  '.datalk-msg-user{align-self:flex-end;border-radius:16px 16px 4px 16px;background:'+primary+';color:#fff;}',
  '.datalk-msg-bot{align-self:flex-start;border-radius:16px 16px 16px 4px;background:#fff;border:1px solid #e2e8f0;color:#334155;box-shadow:0 1px 3px rgba(0,0,0,.04);}',
  /* Typing indicator */
  '.datalk-typing{display:flex;align-items:center;gap:4px;padding:12px 16px;}',
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
  '.datalk-email-input{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-family:'+font+';margin-bottom:8px;outline:none;transition:border-color .15s;}',
  '.datalk-email-input:focus{border-color:'+primary+';}',
  '.datalk-input-row{display:flex;align-items:flex-end;gap:8px;}',
  '.datalk-input{flex:1;border:1px solid #e2e8f0;border-radius:14px;padding:10px 14px;font-size:13.5px;font-family:'+font+';resize:none;outline:none;min-height:40px;max-height:120px;line-height:1.45;transition:border-color .15s;}',
  '.datalk-input:focus{border-color:'+primary+';}',
  '.datalk-send-btn{width:38px;height:38px;border:none;border-radius:12px;background:'+primary+';color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}',
  '.datalk-send-btn:disabled{opacity:.4;cursor:not-allowed;}',
  '.datalk-send-btn svg{width:16px;height:16px;}',
  /* Footer */
  '.datalk-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px;}',
  '.datalk-powered{font-size:11px;color:#94a3b8;}',
  '.datalk-powered strong{font-weight:600;}',
  '.datalk-feedback-btns{display:flex;gap:8px;}',
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
