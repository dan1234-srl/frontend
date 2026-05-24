/**
 * RichTextEditor.tsx
 * Editor WYSIWYG complet pentru descrieri produs.
 * Suportă: Bold, Italic, Underline, Liste, Emoji, YouTube embed, spații libere.
 * NU necesită dependențe externe în afara celor deja instalate.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Youtube,
  Smile,
  AlignLeft,
  AlignCenter,
  Minus,
  Heading2,
  Heading3,
  RotateCcw,
  RotateCw,
  Type,
} from "lucide-react";

// ─── Tipuri ──────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// ─── Emoji Panel ─────────────────────────────────────────────────────────────

const EMOJI_LIST = [
  "✨",
  "🌟",
  "💫",
  "⭐",
  "🔥",
  "💎",
  "🎁",
  "🎀",
  "🛍️",
  "💝",
  "✅",
  "❌",
  "⚠️",
  "📦",
  "🚀",
  "💡",
  "📌",
  "🔑",
  "🔒",
  "🛡️",
  "👍",
  "👏",
  "🙌",
  "💪",
  "🤝",
  "❤️",
  "💙",
  "💚",
  "💛",
  "🩷",
  "📏",
  "⚖️",
  "📐",
  "🔧",
  "⚙️",
  "🏷️",
  "📋",
  "📝",
  "📊",
  "📈",
  "🌸",
  "🌺",
  "🌻",
  "🍀",
  "🌿",
  "🦋",
  "🐾",
  "🌈",
  "☀️",
  "🌙",
];

const EmojiPanel = ({
  onSelect,
  onClose,
}: {
  onSelect: (e: string) => void;
  onClose: () => void;
}) => (
  <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 w-72">
    <div className="grid grid-cols-10 gap-1">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(emoji);
          }}
          className="text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
);

// ─── YouTube Dialog ───────────────────────────────────────────────────────────

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const YouTubeDialog = ({
  onInsert,
  onClose,
}: {
  onInsert: (id: string) => void;
  onClose: () => void;
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleInsert = () => {
    const id = extractYoutubeId(url.trim());
    if (!id) {
      setError("URL YouTube invalid. Încearcă: https://youtu.be/VIDEO_ID");
      return;
    }
    onInsert(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-2xl p-8 w-full max-w-md mx-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <Youtube size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--dark-amethyst)] uppercase tracking-tight">
              Inserează Video YouTube
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Video embed responsive
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
            URL Video
          </label>
          <input
            autoFocus
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--royal-violet)] transition-all border border-zinc-100"
            placeholder="https://youtu.be/... sau https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          {error && (
            <p className="text-[10px] text-red-500 font-bold">{error}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Inserează
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────

const ToolBtn = ({
  onClick,
  active,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`
      w-8 h-8 flex items-center justify-center rounded-lg transition-all text-zinc-500
      hover:bg-[var(--royal-violet)]/10 hover:text-[var(--royal-violet)]
      ${active ? "bg-[var(--royal-violet)]/10 text-[var(--royal-violet)]" : ""}
      ${className}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-zinc-200 mx-1" />;

// ─── Main Editor ──────────────────────────────────────────────────────────────

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Scrie descrierea produsului...",
  minHeight = 280,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const savedRangeRef = useRef<Range | null>(null);
  const isInternalUpdate = useRef(false);

  // Sincronizare inițială value → DOM
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isInternalUpdate.current = true;
      editorRef.current.innerHTML = value || "";
      isInternalUpdate.current = false;
    }
  }, [value]);

  // Detectare formate active la cursor
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
    const alignment =
      document.queryCommandValue("justifyFull") ||
      (document.queryCommandState("justifyCenter") ? "center" : "left");
    if (alignment === "center") formats.add("center");
    setActiveFormats(formats);
  }, []);

  // Salvare selecție (pentru inserare emoji/video)
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  // Comandă format
  const exec = useCallback(
    (cmd: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(cmd, false, value);
      updateActiveFormats();
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange, updateActiveFormats],
  );

  // Inserare HTML la cursor
  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      editorRef.current?.focus();
      restoreSelection();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const fragment = range.createContextualFragment(html);
      range.insertNode(fragment);
      range.collapse(false);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    },
    [restoreSelection, onChange],
  );

  // Inserare Emoji
  const insertEmoji = useCallback(
    (emoji: string) => {
      editorRef.current?.focus();
      restoreSelection();
      exec("insertText", emoji);
      setShowEmoji(false);
    },
    [exec, restoreSelection],
  );

  // Inserare YouTube
  const insertYouTube = useCallback(
    (videoId: string) => {
      const html = `
      <div class="rte-video-wrapper" contenteditable="false" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" 
          allowfullscreen 
          loading="lazy"
          title="YouTube video"
        ></iframe>
      </div><p><br></p>
    `;
      insertHtmlAtCursor(html);
    },
    [insertHtmlAtCursor],
  );

  // Inserare separator orizontal
  const insertHR = useCallback(() => {
    insertHtmlAtCursor(
      '<hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;" /><p><br></p>',
    );
  }, [insertHtmlAtCursor]);

  // Handle input
  const handleInput = useCallback(() => {
    if (isInternalUpdate.current) return;
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  // Tab = inserare 2 spații (nu schimba focusul)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        exec("insertText", "\u00A0\u00A0\u00A0\u00A0");
      }
      updateActiveFormats();
    },
    [exec, updateActiveFormats],
  );

  return (
    <div className="rte-root rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm focus-within:border-[var(--royal-violet)] focus-within:shadow-[0_0_0_3px_rgba(124,44,191,0.07)] transition-all">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2.5 border-b border-zinc-100 bg-zinc-50/70">
        {/* Text style */}
        <ToolBtn
          onClick={() => exec("formatBlock", "h2")}
          title="Titlu mare (H2)"
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => exec("formatBlock", "h3")}
          title="Titlu mic (H3)"
        >
          <Heading3 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => exec("formatBlock", "p")}
          title="Paragraf normal"
        >
          <Type size={14} />
        </ToolBtn>

        <Divider />

        {/* Formatare text */}
        <ToolBtn
          active={activeFormats.has("bold")}
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          active={activeFormats.has("italic")}
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          active={activeFormats.has("underline")}
          onClick={() => exec("underline")}
          title="Subliniat (Ctrl+U)"
        >
          <Underline size={14} />
        </ToolBtn>

        <Divider />

        {/* Liste */}
        <ToolBtn
          active={activeFormats.has("ul")}
          onClick={() => exec("insertUnorderedList")}
          title="Listă cu buline"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          active={activeFormats.has("ol")}
          onClick={() => exec("insertOrderedList")}
          title="Listă numerotată"
        >
          <ListOrdered size={14} />
        </ToolBtn>

        <Divider />

        {/* Aliniere */}
        <ToolBtn
          active={!activeFormats.has("center")}
          onClick={() => exec("justifyLeft")}
          title="Aliniere stânga"
        >
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn
          active={activeFormats.has("center")}
          onClick={() => exec("justifyCenter")}
          title="Aliniere centru"
        >
          <AlignCenter size={14} />
        </ToolBtn>

        <Divider />

        {/* Linie orizontală */}
        <ToolBtn onClick={insertHR} title="Inserează separator">
          <Minus size={14} />
        </ToolBtn>

        <Divider />

        {/* Emoji */}
        <div className="relative">
          <ToolBtn
            onClick={() => {
              saveSelection();
              setShowEmoji((v) => !v);
            }}
            title="Inserează emoji"
            active={showEmoji}
          >
            <Smile size={14} />
          </ToolBtn>
          {showEmoji && (
            <EmojiPanel
              onSelect={insertEmoji}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>

        {/* YouTube */}
        <ToolBtn
          onClick={() => {
            saveSelection();
            setShowYouTube(true);
          }}
          title="Inserează video YouTube"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Youtube size={14} />
        </ToolBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn onClick={() => exec("undo")} title="Anulează (Ctrl+Z)">
          <RotateCcw size={13} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Refă (Ctrl+Y)">
          <RotateCw size={13} />
        </ToolBtn>
      </div>

      {/* ── Editor Area ──────────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        onBlur={saveSelection}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="
          rte-content
          p-5 outline-none text-sm leading-relaxed text-zinc-700
          [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-[var(--dark-amethyst)] [&_h2]:mb-3 [&_h2]:mt-5
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[var(--dark-amethyst)] [&_h3]:mb-2 [&_h3]:mt-4
          [&_p]:mb-3 [&_p]:leading-[1.85]
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
          [&_li]:leading-[1.75]
          [&_strong]:font-black [&_strong]:text-[var(--dark-amethyst)]
          [&_b]:font-black [&_b]:text-[var(--dark-amethyst)]
          [&_em]:italic [&_em]:text-zinc-600
          [&_u]:underline [&_u]:underline-offset-3
          [&_hr]:border-zinc-200 [&_hr]:my-4
          empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300 empty:before:pointer-events-none empty:before:absolute
          relative
        "
      />

      {/* ── YouTube Dialog ───────────────────────────────────────────────── */}
      {showYouTube && (
        <YouTubeDialog
          onInsert={insertYouTube}
          onClose={() => setShowYouTube(false)}
        />
      )}

      {/* ── Styles globale pentru placeholder ───────────────────────────── */}
      <style>{`
        .rte-content:empty::before {
          content: attr(data-placeholder);
          color: #d4d4d8;
          pointer-events: none;
          position: absolute;
        }
        .rte-content:focus { outline: none; }
        .rte-video-wrapper iframe { border-radius: 12px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
