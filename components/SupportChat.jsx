'use client';

/**
 * SupportChat.jsx — Drapit Support Chatbot
 *
 * Props:
 *   apiEndpoint  - string  - URL of your backend proxy (default: "/api/support-chat")
 *
 * Backend verwacht een POST request met body:
 *   { system, messages, model, max_tokens }
 * En stuurt terug:
 *   { content: [{ type: "text", text: "..." }] }
 *
 * Zie SupportChat.server-example.js voor een kant-en-klare Express route.
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  .sc-root * { box-sizing: border-box; }

  @keyframes sc-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%            { transform: translateY(-6px); }
  }
  @keyframes sc-fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sc-pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(0, 229, 196, 0.4); }
    70%  { box-shadow: 0 0 0 8px rgba(0, 229, 196, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 229, 196, 0); }
  }
  @keyframes sc-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes sc-spin {
    to { transform: rotate(360deg); }
  }

  .sc-message-wrap { animation: sc-fade-up 0.25s ease forwards; }

  .sc-scroll::-webkit-scrollbar { width: 4px; }
  .sc-scroll::-webkit-scrollbar-track { background: transparent; }
  .sc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .sc-textarea {
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    width: 100%;
    color: #E8EDF8;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.5;
    min-height: 24px;
    max-height: 120px;
    overflow-y: auto;
  }
  .sc-textarea::placeholder { color: #3D4A63; }

  .sc-send-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .sc-send-btn:hover { transform: scale(1.08); }
  .sc-send-btn:active { transform: scale(0.95); }

  .sc-quick-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 140px;
  }
  .sc-quick-card:hover {
    background: rgba(0,229,196,0.07);
    border-color: rgba(0,229,196,0.25);
    transform: translateY(-2px);
  }

  .sc-img-preview {
    position: relative;
    display: inline-block;
  }
  .sc-img-remove {
    position: absolute; top: -6px; right: -6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #EF4444; border: none; cursor: pointer;
    font-size: 10px; color: white;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s ease;
  }
  .sc-img-remove:hover { transform: scale(1.15); }

  .sc-drop-zone {
    position: absolute; inset: 0;
    background: rgba(0,229,196,0.06);
    border: 2px dashed rgba(0,229,196,0.5);
    border-radius: 16px;
    z-index: 10;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px;
    pointer-events: none;
    animation: sc-fade-up 0.15s ease;
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
      parts.push(<strong key={key++} style={{ color: "#E8EDF8", fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[3])
      parts.push(<code key={key++} style={{ background: "rgba(0,229,196,0.13)", color: "#00E5C4", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{match[3]}</code>);
    else if (match[4])
      parts.push(<em key={key++} style={{ opacity: 0.85 }}>{match[4]}</em>);
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
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,229,196,0.18)",
          borderRadius: 10, padding: "12px 16px", overflowX: "auto",
          margin: "10px 0", fontSize: 12.5, fontFamily: "'JetBrains Mono','Fira Code',monospace",
          color: "#9FE5C9", lineHeight: 1.7, whiteSpace: "pre",
        }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++; continue;
    }

    // ## heading
    if (line.startsWith("## ")) {
      els.push(
        <p key={k++} style={{ color: "#00E5C4", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 4px", fontFamily: "Syne, sans-serif" }}>
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
      els.push(<hr key={k++} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "10px 0" }} />);
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
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #00E5C4 0%, #0087EA 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, boxShadow: "0 0 14px rgba(0,229,196,0.35)",
      animation: "sc-pulse-ring 3s ease infinite",
    }}>
      ✦
    </div>
  );
}

function TypingDots() {
  return (
    <div className="sc-message-wrap" style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
      <Avatar />
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px 18px 18px 4px", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#00E5C4",
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
          ? "linear-gradient(135deg, #00C9A7 0%, #0087EA 100%)"
          : "rgba(255,255,255,0.04)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "11px 15px",
        color: isUser ? "#fff" : "#C4CEDF",
        fontSize: 14,
        backdropFilter: "blur(10px)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Images */}
        {msg.images?.length > 0 && (
          <div style={{ marginBottom: msg.content ? 10 : 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {msg.images.map((src, i) => (
              <img key={i} src={src} alt="Screenshot" style={{
                maxWidth: 240, maxHeight: 170, borderRadius: 8, objectFit: "contain",
                border: "1px solid rgba(255,255,255,0.12)",
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
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: "#E2E8F5", fontSize: 13, fontWeight: 700, fontFamily: "Syne, sans-serif", marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#4E5E7A", fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupportChat({ apiEndpoint = "/api/support-chat" }) {

  const INITIAL_MSG = {
    role: "assistant",
    content: "Hoi! Ik ben de Drapit support assistent. Ik help je graag de widget te installeren — op Shopify of op je eigen website.\n\nKan je hieronder een screenshot delen als je vastloopt? Dan kijk ik direct mee! 👋",
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
      // Build Claude-format messages (with vision support)
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
      fontFamily: "'DM Sans', sans-serif",
      background: "#07090F",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Inject CSS */}
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,229,196,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Chat panel */}
      <div style={{
        width: "100%", maxWidth: 720,
        background: "rgba(13,18,30,0.95)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 48px)",
        maxHeight: 760,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        position: "relative",
      }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="sc-drop-zone">
            <div style={{ fontSize: 36 }}>🖼️</div>
            <div style={{ color: "#00E5C4", fontWeight: 600, fontSize: 15, fontFamily: "Syne, sans-serif" }}>Screenshot loslaten</div>
            <div style={{ color: "#4E5E7A", fontSize: 13 }}>Ik analyseer het direct voor je</div>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 14,
          background: "rgba(255,255,255,0.02)",
          flexShrink: 0,
        }}>
          {/* Logo / avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #00E5C4 0%, #0087EA 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 16px rgba(0,229,196,0.25)",
            flexShrink: 0,
          }}>
            ✦
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: "#E8EDF8", fontWeight: 700, fontSize: 15, fontFamily: "Syne, sans-serif", letterSpacing: "-0.01em" }}>
              Drapit Support
            </div>
            <div style={{ color: "#4E5E7A", fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#00E5C4", display: "inline-block",
                boxShadow: "0 0 6px rgba(0,229,196,0.6)",
              }} />
              Online — we helpen je snel
            </div>
          </div>

          {/* Badge */}
          <div style={{
            background: "rgba(0,229,196,0.1)", border: "1px solid rgba(0,229,196,0.2)",
            borderRadius: 20, padding: "4px 12px",
            color: "#00E5C4", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
            fontFamily: "Syne, sans-serif",
          }}>
            AI SUPPORT
          </div>
        </div>

        {/* ── Messages ───────────────────────────────────────────────────── */}
        <div className="sc-scroll" style={{
          flex: 1, overflowY: "auto", padding: "24px 24px 8px",
        }}>

          {/* Quick action cards — shown only at start */}
          {showQuick && messages.length <= 1 && (
            <div style={{ marginBottom: 24, animation: "sc-fade-up 0.3s ease" }}>
              <div style={{ color: "#3D4A63", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, fontFamily: "Syne, sans-serif" }}>
                Waarmee kan ik je helpen?
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <QuickCard
                  icon="🛍️"
                  title="Shopify installatie"
                  desc="Widget toevoegen aan je Shopify store"
                  onClick={() => sendWith("Hoe installeer ik de Drapit widget op mijn Shopify store?")}
                />
                <QuickCard
                  icon="💻"
                  title="Eigen website"
                  desc="Widget embedden zonder Shopify"
                  onClick={() => sendWith("Hoe voeg ik de Drapit widget toe aan mijn eigen website (niet Shopify)?")}
                />
                <QuickCard
                  icon="🔧"
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

          {/* Typing indicator */}
          {isLoading && <TypingDots />}

          <div ref={endRef} />
        </div>

        {/* ── Pending images preview ─────────────────────────────────────── */}
        {pendingImages.length > 0 && (
          <div style={{
            padding: "10px 24px 0",
            display: "flex", flexWrap: "wrap", gap: 8,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}>
            {pendingImages.map((src, i) => (
              <div key={i} className="sc-img-preview">
                <img src={src} alt="" style={{
                  width: 56, height: 56, objectFit: "cover", borderRadius: 8,
                  border: "1px solid rgba(0,229,196,0.3)",
                }} />
                <button
                  className="sc-img-remove"
                  onClick={() => setPending(prev => prev.filter((_, j) => j !== i))}
                  title="Verwijderen"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "14px 18px 18px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "10px 12px",
            transition: "border-color 0.2s",
          }}
            onFocus={() => {}} // handled via CSS ideally
          >
            {/* Screenshot upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Screenshot bijvoegen"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#3D4A63", fontSize: 18, padding: "4px",
                borderRadius: 8, transition: "color 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#00E5C4"}
              onMouseLeave={e => e.currentTarget.style.color = "#3D4A63"}
            >
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="sc-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Stel je vraag of plak je code hier… (Enter om te versturen)"
              rows={1}
            />

            {/* Send button */}
            <button
              className="sc-send-btn"
              onClick={handleSend}
              disabled={!canSend}
              style={{
                background: canSend
                  ? "linear-gradient(135deg, #00E5C4, #0087EA)"
                  : "rgba(255,255,255,0.06)",
                color: canSend ? "#fff" : "#2A3346",
                cursor: canSend ? "pointer" : "not-allowed",
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "sc-spin 0.8s linear infinite",
                }} />
              ) : "→"}
            </button>
          </div>

          {/* Hint */}
          <div style={{ color: "#2A3346", fontSize: 11, textAlign: "center", marginTop: 10 }}>
            Sleep een screenshot in dit venster of klik op 📎 om een afbeelding te delen
          </div>
        </div>
      </div>
    </div>
  );
}
