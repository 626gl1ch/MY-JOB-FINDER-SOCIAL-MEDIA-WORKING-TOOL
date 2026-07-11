import React, { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

function SafeShadowRoot({ html, css }) {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      const root = hostRef.current.attachShadow({ mode: "open" });
      setShadowRoot(root);
    }
  }, [shadowRoot]);

  useEffect(() => {
    if (shadowRoot) {
      // Inject some custom CSS into the shadow root to make it match the neon theme better
      const customCss = `
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `;

      shadowRoot.innerHTML = `
        <style>${css} ${customCss}</style>
        <div class="shadow-body">${html}</div>
      `;

      const handleShadowClick = (e) => {
        const path = e.composedPath();
        
        // Find if any element in the click path is a copy button or tab
        const copyBtn = path.find(el => el.classList && el.classList.contains("copy-btn"));
        const tabBtn = path.find(el => el.classList && el.classList.contains("platform-tab"));

        if (copyBtn) {
          const onclickAttr = copyBtn.getAttribute("onclick");
          if (onclickAttr) {
            const match = onclickAttr.match(/copyPost\(this,\s*'([^']+)'\)/);
            if (match) {
              const targetId = match[1];
              const textEl = shadowRoot.getElementById(targetId);
              if (textEl) {
                const text = textEl.innerText || textEl.textContent;
                navigator.clipboard.writeText(text).then(() => {
                  const originalText = copyBtn.innerHTML;
                  copyBtn.innerHTML = "✅ Copied!";
                  copyBtn.classList.add("copied");
                  setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove("copied");
                  }, 2000);
                }).catch(err => {
                  console.error("Clipboard write failed: ", err);
                });
              }
            }
          }
        } else if (tabBtn) {
          const onclickAttr = tabBtn.getAttribute("onclick");
          if (onclickAttr) {
            const match = onclickAttr.match(/showPanel\(['"]([^'"]+)['"],\s*this\)/);
            if (match) {
              const panelId = match[1];
              // Update tabs
              shadowRoot.querySelectorAll(".platform-tab").forEach(btn => btn.classList.remove("active"));
              tabBtn.classList.add("active");
              // Update panels
              shadowRoot.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
              const activePanel = shadowRoot.getElementById(`panel-${panelId}`);
              if (activePanel) {
                activePanel.classList.add("active");
              }
            }
          }
        }
      };

      shadowRoot.addEventListener("click", handleShadowClick);
      return () => {
        shadowRoot.removeEventListener("click", handleShadowClick);
      };
    }
  }, [shadowRoot, html, css]);

  return <div ref={hostRef} className="w-full h-full overflow-y-auto" />;
}

export default function MarketingPlaybook() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/playbook.html")
      .then((res) => res.text())
      .then((text) => {
        const styleMatch = text.match(/<style[^>]*>([\s\S]*)<\/style>/i);
        if (styleMatch) {
          setCss(styleMatch[1]);
        }
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          setHtml(bodyMatch[1]);
        } else {
          setHtml(text);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading playbook:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden relative min-h-screen bg-[#121215] pb-32">
      {/* Background glow for consistency with the rest of the app */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-blob w-[500px] h-[500px] bg-accent/10 top-0 left-1/4 opacity-40" />
      </div>

      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-surface/80 backdrop-blur-xl shrink-0 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-accent mb-2">
            <BookOpen size={14} /> Library
          </div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            Marketing Playbook
          </h1>
          <p className="text-sm text-muted mt-1 font-medium">
            Copy and paste high-converting templates natively.
          </p>
        </div>
      </div>
      
      <div className="flex-1 w-full relative z-10 overflow-hidden bg-black/20">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted font-mono">
            Loading playbook...
          </div>
        ) : (
          <SafeShadowRoot html={html} css={css} />
        )}
      </div>
    </div>
  );
}
