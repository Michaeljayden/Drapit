'use client';

/**
 * SupportChat.jsx — Drapit Support Chatbot (Light Theme)
 *
 * Props:
 *   apiEndpoint  - string  - URL of your backend proxy (default: "/api/support-chat")
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconSupport({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconStore({ size = 22, color = "#1D6FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-4h16l1 4" />
      <path d="M3 9v1a3 3 0 0 0 6 0V9" />
      <path d="M9 9v1a3 3 0 0 0 6 0V9" />
      <path d="M15 9v1a3 3 0 0 0 6 0V9" />
      <path d="M4 10v10h16V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function IconMonitor({ size = 22, color = "#1D6FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconWrench({ size = 22, color = "#1D6FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconPaperclip({ size = 18, color = "#94A3B8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49" />
    </svg>
  );
}

function IconImage({ size = 32, color = "#1D6FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconSend({ size = 16, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconX({ size = 10, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .sc-root * { box-sizing: border-box; }

  @keyframes sc-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%            { transform: translateY(-5px); }
  }
  @keyframes sc-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sc-spin {
    to { transform: rotate(360deg); }
  }

  .sc-message-wrap { animation: sc-fade-up 0.25s ease forwards; }

  .sc-scroll::-webkit-scrollbar { width: 5px; }
  .sc-scroll::-webkit-scrollbar-track { background: transparent; }
  .sc-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 3px; }
  .sc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.14); }

  .sc-textarea {
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    width: 100%;
    color: #0F172A;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    min-height: 24px;
    max-height: 120px;
    overflow-y: auto;
  }
  .sc-textarea::placeholder { color: #94A3B8; }

  .sc-send-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .sc-send-btn:hover { transform: scale(1.05); }
  .sc-send-btn:active { transform: scale(0.96); }

  .sc-quick-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 140px;
  }
  .sc-quick-card:hover {
    border-color: #1D6FD8;
    box-shadow: 0 2px 8px rgba(29, 111, 216, 0.1);
    transform: translateY(-1px);
  }

  .sc-img-preview {
    position: relative;
    display: inline-block;
  }
  .sc-img-remove {
    position: absolute; top: -6px; right: -6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #DC2626; border: 2px solid #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s ease;
    padding: 0;
  }
  .sc-img-remove:hover { transform: scale(1.15); }

  .sc-drop-zone {
    position: absolute; inset: 0;
    background: rgba(29, 111, 216, 0.04);
    border: 2px dashed rgba(29, 111, 216, 0.4);
    border-radius: 16px;
    z-index: 10;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px;
    pointer-events: none;
    animation: sc-fade-up 0.15s ease;
  }

  .sc-input-wrap {
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sc-input-wrap:focus-within {
    border-color: #1D6FD8 !important;
    box-shadow: 0 0 0 3px rgba(29, 111, 216, 0.1) !important;
  }
`;

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Je bent de Drapit Support Assistent — een vriendelijke en deskundige helper voor Drapit, een AI virtual try-on widget voor modewinkels. Je helpt merchants de widget installeren op hun Shopify store of eigen website.

Spreek altijd vriendelijk en begrijpelijk. Ga er van uit dat de gebruiker NIET technisch is, tenzij ze dat zelf laten zien. Gebruik genummerde stappen voor instructies. Houd antwoorden beknopt maar volledig. Moedig gebruikers aan als het goed gaat.

---

## Over Drapit
Drapit is een AI virtual try-on widget waarmee shoppers kleding virtueel kunnen passen. De widget werkt op:
1. **Shopify stores** — via de Drapit Shopify app (makkelijkste optie)
2. **Andere websites** — via een JavaScript snippet (standalone)

---

## Shopify Installatie (stap voor stap)

**Stap 1 — App installeren**
Ga naar de Shopify App Store en zoek op "Drapit". Klik op "Toevoegen aan store" en volg de stappen.

**Stap 2 — Widget activeren**
In je Shopify Admin ga je naar: Online Store → Thema's → Aanpassen (Customize)
Klik links op "App embeds" en zet de schakelaar bij "Drapit Widget" aan.

**Stap 3 — Opslaan**
Klik op Opslaan. De widget verschijnt nu automatisch op je productpagina's.

**Veelvoorkomende problemen:**
- Widget verschijnt niet: Controleer of je thema Online Store 2.0 ondersteunt (bijv. Dawn, Craft, Debut). Oudere thema's worden niet automatisch ondersteund.
- App embeds niet zichtbaar: Ga naar Online Store → Thema's → (kies je actieve thema) → Aanpassen → en scroll links naar "App embeds".
- API sleutel fout: Open de Drapit app in je admin en controleer of de sleutel correct is ingevoerd.

---

## Standalone Installatie (zonder Shopify)

Voeg dit stukje code toe aan je productpagina, net vóór de </body> tag:

\`\`\`html
<!-- Stap 1: Voeg dit toe op de plek waar de widget moet komen -->
<div id="drapit-widget"></div>

<!-- Stap 2: Configuratie en script (voor </body> plaatsen) -->
<script>
  window.DrapitConfig = {
    apiKey: 'JOUW_API_SLEUTEL_HIER',
    containerId: 'drapit-widget'
  };
</script>
<script src="https://cdn.drapit.io/widget.js" async></script>
\`\`\`

**Hoe doe je dit stap voor stap:**
1. Ga naar je Drapit dashboard → Instellingen → API sleutel kopiëren
2. Vervang JOUW_API_SLEUTEL_HIER door jouw echte sleutel
3. Plak de code in je HTML bestand, net vóór </body>
4. Sla het bestand op en herlaad de pagina
5. De widget zou nu zichtbaar moeten zijn!

**Veelvoorkomende problemen:**
- Widget laadt niet: Druk op F12 → Console en kijk of er foutmeldingen staan. Deel een screenshot!
- API sleutel fout: Zorg dat je de volledige sleutel hebt gekopieerd, zonder spaties voor of na
- Widget staat op verkeerde plek: Verplaats de <div id="drapit-widget"> naar de gewenste locatie
- Pagina heeft geen </body>: Voeg de code dan onderaan het bestand toe

---

## Bij het bekijken van screenshots
Analyseer de screenshot zorgvuldig. Vertel specifiek wat je ziet, wat het probleem lijkt te zijn, en geef concrete vervolgstappen gebaseerd op wat zichtbaar is. Wees positief en concreet.

Als je code ziet in een screenshot, identificeer dan eventuele fouten of ontbrekende onderdelen.

---

Spreek altijd vriendelijk en geduldig. Als iets onduidelijk is, vraag dan rustig om meer informatie of een screenshot.`;

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function inlineFormat(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`|\*(.+?)\*)/g;
  let last = 0, match, key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2])
      parts.push(<strong key={key++} style={{ color: "#0F172A", fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[3])
      parts.push(<code key={key++} style={{ background: "#EBF3FF", color: "#1D6FD8", padding: "2px 6px", borderRadius: 4, fontSize: 12.5, fontFamily: "monospace" }}>{match[3]}</code>);
    else if (match[4])
      parts.push(<em key={key++} style={{ color: "#475569" }}>{match[4]}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function renderMd(text) {
  const lines = text.split("\n");
  const els = [];
  let i = 0, k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ``` code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) codeLines.push(lines[i++]);
      els.push(
        <pre key={k++} style={{
          background: "#F1F5F9", border: "1px solid #E2E8F0",
          borderRadius: 10, padding: "12px 16px", overflowX: "auto",
          margin: "10px 0", fontSize: 12.5, fontFamily: "'JetBrains Mono','Fira Code',monospace",
          color: "#334155", lineHeight: 1.7, whiteSpace: "pre",
        }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++; continue;
    }

    // ## heading
    if (line.startsWith("## ")) {
      els.push(
        <p key={k++} style={{ color: "#1D6FD8", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "14px 0 4px", fontFamily: "'Inter', sans-serif" }}>
          {line.slice(3)}
        </p>
      );
      i++; continue;
    }

    // numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^\d+\.\s+(.+)/);
        items.push(<li key={i} style={{ marginBottom: 4 }}>{inlineFormat(m[1])}</li>);
        i++;
      }
      els.push(<ol key={k++} style={{ paddingLeft: 20, margin: "6px 0", lineHeight: 1.7 }}>{items}</ol>);
      continue;
    }

    // bullet list
    if (/^[-•]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        const m = lines[i].match(/^[-•]\s+(.+)/);
        items.push(<li key={i} style={{ marginBottom: 4 }}>{inlineFormat(m[1])}</li>);
        i++;
      }
      els.push(<ul key={k++} style={{ paddingLeft: 20, margin: "6px 0", lineHeight: 1.7 }}>{items}</ul>);
      continue;
    }

    // hr
    if (line.trim() === "---") {
      els.push(<hr key={k++} style={{ border: "none", borderTop: "1px solid #E2E8F0", margin: "10px 0" }} />);
      i++; continue;
    }

    // empty line
    if (line.trim() === "") {
      els.push(<div key={k++} style={{ height: 6 }} />);
      i++; continue;
    }

    // paragraph
    els.push(<p key={k++} style={{ margin: "3px 0", lineHeight: 1.65 }}>{inlineFormat(line)}</p>);
    i++;
  }
  return els;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg, #1D6FD8 0%, #1558B0 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(29, 111, 216, 0.25)",
    }}>
      <IconSupport size={16} color="#fff" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="sc-message-wrap" style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
      <Avatar />
      <div style={{
        background: "#F1F5F9", border: "1px solid #E2E8F0",
        borderRadius: "16px 16px 16px 4px", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#1D6FD8",
            animation: `sc-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className="sc-message-wrap" style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16, alignItems: "flex-end", gap: 10,
    }}>
      {!isUser && <Avatar />}
      <div style={{
        maxWidth: "82%",
        background: isUser
          ? "linear-gradient(135deg, #1D6FD8 0%, #1558B0 100%)"
          : "#F1F5F9",
        border: isUser ? "none" : "1px solid #E2E8F0",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        padding: "11px 15px",
        color: isUser ? "#fff" : "#334155",
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        boxShadow: isUser ? "0 2px 8px rgba(29, 111, 216, 0.2)" : "none",
      }}>
        {/* Images */}
        {msg.images?.length > 0 && (
          <div style={{ marginBottom: msg.content ? 10 : 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {msg.images.map((src, i) => (
              <img key={i} src={src} alt="Screenshot" style={{
                maxWidth: 240, maxHeight: 170, borderRadius: 8, objectFit: "contain",
                border: "1px solid #E2E8F0",
              }} />
            ))}
          </div>
        )}
        {/* Text */}
        {msg.content && (
          isUser
            ? <span style={{ lineHeight: 1.55 }}>{msg.content}</span>
            : <div style={{ lineHeight: 1.6 }}>{renderMd(msg.content)}</div>
        )}
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick }) {
  return (
    <button className="sc-quick-card" onClick={onClick}>
      <div style={{ marginBottom: 10 }}>{icon}</div>
      <div style={{ color: "#0F172A", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupportChat({ apiEndpoint = "/api/support-chat" }) {

  const INITIAL_MSG = {
    role: "assistant",
    content: "Hoi! Ik ben de Drapit support assistent. Ik help je graag de widget te installeren — op Shopify of op je eigen website.\n\nDeel gerust een screenshot als je vastloopt, dan kijk ik direct mee.",
    images: [],
  };

  const [messages, setMessages]       = useState([INITIAL_MSG]);
  const [input, setInput]             = useState("");
  const [pendingImages, setPending]   = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isDragging, setIsDragging]   = useState(false);
  const [showQuick, setShowQuick]     = useState(true);

  const endRef      = useRef(null);
  const fileRef     = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── File handling ──────────────────────────────────────────────────────────

  const addFiles = useCallback((files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => setPending(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  }, []);

  const onDragOver  = e => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop      = e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };

  // ── Send ───────────────────────────────────────────────────────────────────

  const sendWith = useCallback(async (text, images = []) => {
    if (!text.trim() && images.length === 0) return;
    setShowQuick(false);

    const userMsg = { role: "user", content: text.trim(), images };
    const thread  = [...messages, userMsg];

    setMessages(thread);
    setInput("");
    setPending([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const apiMsgs = thread.map(msg => {
        if (msg.images?.length > 0) {
          const content = msg.images.map(img => ({
            type: "image",
            source: {
              type: "base64",
              media_type: img.split(";")[0].split(":")[1],
              data: img.split(",")[1],
            },
          }));
          if (msg.content) content.push({ type: "text", text: msg.content });
          return { role: msg.role, content };
        }
        return { role: msg.role, content: msg.content };
      });

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: apiMsgs,
          model: "claude-opus-4-6",
          max_tokens: 1500,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const reply =
        data?.content?.[0]?.text ||
        data?.text ||
        data?.message ||
        "Sorry, ik kon je bericht niet verwerken. Probeer het nog eens!";

      setMessages(prev => [...prev, { role: "assistant", content: reply, images: [] }]);
    } catch (err) {
      console.error("[SupportChat]", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oeps — ik heb even geen verbinding. Probeer het nog eens, of stuur een e-mail naar support@drapit.io.",
        images: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, apiEndpoint]);

  const handleSend = () => sendWith(input, pendingImages);

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = e => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const canSend = (input.trim() || pendingImages.length > 0) && !isLoading;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="sc-root" style={{
      fontFamily: "'Inter', sans-serif",
      background: "transparent",
      minHeight: "100%",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 0,
    }}>
      <style>{CSS}</style>

      {/* Chat panel */}
      <div style={{
        width: "100%", maxWidth: 760,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 80px)",
        maxHeight: 780,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(15, 39, 68, 0.08)",
        position: "relative",
      }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="sc-drop-zone">
            <IconImage size={36} color="#1D6FD8" />
            <div style={{ color: "#1D6FD8", fontWeight: 600, fontSize: 15, fontFamily: "'Inter', sans-serif" }}>Screenshot loslaten</div>
            <div style={{ color: "#64748B", fontSize: 13 }}>Ik analyseer het direct voor je</div>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", gap: 14,
          background: "#FFFFFF",
          flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #1D6FD8 0%, #1558B0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(29, 111, 216, 0.25)",
            flexShrink: 0,
          }}>
            <IconSupport size={20} color="#fff" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 15, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
              Drapit Support
            </div>
            <div style={{ color: "#64748B", fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#16A34A", display: "inline-block",
                boxShadow: "0 0 6px rgba(22, 163, 74, 0.5)",
              }} />
              Online — we helpen je snel
            </div>
          </div>

          <div style={{
            background: "#EBF3FF", border: "1px solid #D0E2FF",
            borderRadius: 20, padding: "5px 14px",
            color: "#1D6FD8", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
            fontFamily: "'Inter', sans-serif",
          }}>
            AI SUPPORT
          </div>
        </div>

        {/* ── Messages ───────────────────────────────────────────────────── */}
        <div className="sc-scroll" style={{
          flex: 1, overflowY: "auto", padding: "24px 24px 8px",
        }}>

          {/* Quick action cards */}
          {showQuick && messages.length <= 1 && (
            <div style={{ marginBottom: 24, animation: "sc-fade-up 0.3s ease" }}>
              <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
                Waarmee kan ik je helpen?
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <QuickCard
                  icon={<IconStore size={24} color="#1D6FD8" />}
                  title="Shopify installatie"
                  desc="Widget toevoegen aan je Shopify store"
                  onClick={() => sendWith("Hoe installeer ik de Drapit widget op mijn Shopify store?")}
                />
                <QuickCard
                  icon={<IconMonitor size={24} color="#1D6FD8" />}
                  title="Eigen website"
                  desc="Widget embedden zonder Shopify"
                  onClick={() => sendWith("Hoe voeg ik de Drapit widget toe aan mijn eigen website (niet Shopify)?")}
                />
                <QuickCard
                  icon={<IconWrench size={24} color="#1D6FD8" />}
                  title="Probleem oplossen"
                  desc="Widget werkt niet of is niet zichtbaar"
                  onClick={() => sendWith("De widget werkt niet of is niet zichtbaar op mijn website. Wat kan ik doen?")}
                />
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}

          {isLoading && <TypingDots />}

          <div ref={endRef} />
        </div>

        {/* ── Pending images preview ─────────────────────────────────────── */}
        {pendingImages.length > 0 && (
          <div style={{
            padding: "10px 24px 0",
            display: "flex", flexWrap: "wrap", gap: 8,
            borderTop: "1px solid #E2E8F0",
            flexShrink: 0,
          }}>
            {pendingImages.map((src, i) => (
              <div key={i} className="sc-img-preview">
                <img src={src} alt="" style={{
                  width: 56, height: 56, objectFit: "cover", borderRadius: 8,
                  border: "1px solid #E2E8F0",
                }} />
                <button
                  className="sc-img-remove"
                  onClick={() => setPending(prev => prev.filter((_, j) => j !== i))}
                  title="Verwijderen"
                ><IconX size={8} color="#fff" /></button>
              </div>
            ))}
          </div>
        )}

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "14px 18px 18px",
          borderTop: "1px solid #E2E8F0",
          background: "#FAFBFC",
          flexShrink: 0,
        }}>
          <div className="sc-input-wrap" style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12, padding: "10px 12px",
          }}>
            <button
              onClick={() => fileRef.current?.click()}
              title="Screenshot bijvoegen"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "4px",
                borderRadius: 8, transition: "opacity 0.2s",
                flexShrink: 0, opacity: 0.5,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
            >
              <IconPaperclip size={18} color="#64748B" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
            />

            <textarea
              ref={textareaRef}
              className="sc-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Stel je vraag of plak je code hier... (Enter om te versturen)"
              rows={1}
            />

            <button
              className="sc-send-btn"
              onClick={handleSend}
              disabled={!canSend}
              style={{
                background: canSend
                  ? "linear-gradient(135deg, #1D6FD8, #1558B0)"
                  : "#F1F5F9",
                color: canSend ? "#fff" : "#CBD5E1",
                cursor: canSend ? "pointer" : "not-allowed",
                boxShadow: canSend ? "0 2px 6px rgba(29, 111, 216, 0.25)" : "none",
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "sc-spin 0.8s linear infinite",
                }} />
              ) : <IconSend size={15} color={canSend ? "#fff" : "#CBD5E1"} />}
            </button>
          </div>

          <div style={{ color: "#94A3B8", fontSize: 11, textAlign: "center", marginTop: 10 }}>
            Sleep een screenshot in dit venster of klik op het paperclip-icoon om een afbeelding te delen
          </div>
        </div>
      </div>
    </div>
  );
}
