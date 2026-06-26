/**
 * ProductAttributesEditor.tsx
 *
 * Componentă reutilizabilă pentru editarea atributelor unui produs în admin.
 *
 * FOLOSIRE în pagina de admin produs:
 * <ProductAttributesEditor sku={product.sku} categoryId={product.category_id} />
 */

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Tag,
  Sparkles,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// ─────────────────────────────────────────────────────────────────────────────
// TIPURI
// ─────────────────────────────────────────────────────────────────────────────

interface AttributeEntry {
  key: string;
  value: string;
  isNew?: boolean; // Introdus manual în această sesiune
  fromDict?: boolean; // Cheie selectată din dicționar
}

interface DictAttribute {
  id: string;
  original_key: string;
  display_label: string;
  possible_values?: string[];
}

interface CategoryAttribute {
  label: string;
  possible_values: string[];
}

interface ProductAttributesEditorProps {
  sku: string;
  categoryId?: string;
  initialAttributes?: Record<string, string>; // Din ProductOut.attributes_json
  onSaved?: (newAttributes: Record<string, string>) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAR: Normalizare cheie (identic cu backend-ul)
// ─────────────────────────────────────────────────────────────────────────────

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTA PRINCIPALĂ
// ─────────────────────────────────────────────────────────────────────────────

const ProductAttributesEditor = ({
  sku,
  categoryId,
  initialAttributes = {},
  onSaved,
  className = "",
}: ProductAttributesEditorProps) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<AttributeEntry[]>([]);
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Dicționar global (din AdminAttributes)
  const [dictAttrs, setDictAttrs] = useState<DictAttribute[]>([]);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [dictSearch, setDictSearch] = useState("");
  const [showDictDropdown, setShowDictDropdown] = useState(false);

  // Atribute recomandate din categorie
  const [catAttrs, setCatAttrs] = useState<Record<string, CategoryAttribute>>(
    {},
  );

  // Cheie nouă manuală
  const [newKeyRaw, setNewKeyRaw] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  // ── Inițializare din props ─────────────────────────────────────────────────
  useEffect(() => {
    const initial = Object.entries(initialAttributes).map(([key, value]) => ({
      key,
      value,
      isNew: false,
    }));
    setEntries(initial);
    setRemovedKeys([]);
    setIsDirty(false);
  }, [sku]);

  // ── Fetch: Dicționar atribute aprobate ────────────────────────────────────
  const fetchDictionary = useCallback(async () => {
    setIsDictLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/attributes/?status=APPROVED&limit=100&search=${encodeURIComponent(dictSearch)}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setDictAttrs(data.items || []);
      }
    } catch {
      // Silent fail — dicționarul e opțional
    } finally {
      setIsDictLoading(false);
    }
  }, [dictSearch]);

  useEffect(() => {
    if (showDictDropdown) fetchDictionary();
  }, [showDictDropdown, dictSearch]);

  // ── Fetch: Atribute recomandate din categorie ──────────────────────────────
  useEffect(() => {
    if (!categoryId) return;
    fetch(
      `${API_BASE}/api/v1/products/admin/categories/${categoryId}/attributes`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((data) => setCatAttrs(data.attributes || {}))
      .catch(() => {});
  }, [categoryId]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const existingKeys = new Set(entries.map((e) => e.key));

  const markDirty = () => setIsDirty(true);

  const updateValue = (index: number, value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, value } : e)),
    );
    markDirty();
  };

  const removeEntry = (index: number) => {
    const key = entries[index].key;
    if (!entries[index].isNew) {
      // Dacă era un atribut existent, îl adăugăm în lista de șterse
      setRemovedKeys((prev) => [...prev, key]);
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  const addFromDict = (attr: DictAttribute) => {
    const key = attr.original_key;
    if (existingKeys.has(key)) {
      toast.warning(`Atributul "${key}" există deja.`);
      setShowDictDropdown(false);
      return;
    }
    setEntries((prev) => [
      ...prev,
      { key, value: "", isNew: true, fromDict: true },
    ]);
    setShowDictDropdown(false);
    setDictSearch("");
    markDirty();
  };

  const addSuggestedCatAttr = (key: string) => {
    if (existingKeys.has(key)) return;
    setEntries((prev) => [
      ...prev,
      { key, value: "", isNew: true, fromDict: false },
    ]);
    markDirty();
  };

  const addManualKey = () => {
    const cleanKey = normalizeKey(newKeyRaw);
    if (!cleanKey) {
      toast.error("Cheia nu poate fi goală.");
      return;
    }
    if (existingKeys.has(cleanKey)) {
      toast.warning(`Cheia "${cleanKey}" există deja.`);
      return;
    }
    setEntries((prev) => [
      ...prev,
      { key: cleanKey, value: newValue.trim(), isNew: true },
    ]);
    setNewKeyRaw("");
    setNewValue("");
    setShowManualForm(false);
    markDirty();
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Construim payload: doar atributele cu valoare non-goală
    const attributesToSend: Record<string, string> = {};
    for (const e of entries) {
      if (e.value.trim()) {
        attributesToSend[e.key] = e.value.trim();
      }
    }

    // Cheile cu valoare goală — le ștergem
    const keysToRemove = [
      ...removedKeys,
      ...entries.filter((e) => !e.value.trim()).map((e) => e.key),
    ];

    setIsSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/products/admin/${sku}/attributes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            attributes: attributesToSend,
            remove_keys: [...new Set(keysToRemove)],
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Eroare la salvare.");
      }

      const updatedProduct = await res.json();
      const newAttrs = updatedProduct.attributes_json || {};

      // Re-populăm state-ul cu datele proaspete din server
      setEntries(
        Object.entries(newAttrs).map(([key, value]) => ({
          key,
          value: String(value),
          isNew: false,
        })),
      );
      setRemovedKeys([]);
      setIsDirty(false);

      toast.success("Atributele au fost salvate și indexate.");
      onSaved?.(newAttrs);
    } catch (err: any) {
      toast.error(err.message || "Eroare server.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Atribute din categorie care nu sunt deja adăugate ─────────────────────
  const suggestedCatKeys = Object.keys(catAttrs).filter(
    (key) => !existingKeys.has(key),
  );

  // ── Dicționar filtrat (fără cheile deja existente) ────────────────────────
  const filteredDict = dictAttrs.filter(
    (a) =>
      !existingKeys.has(a.original_key) &&
      (a.display_label.toLowerCase().includes(dictSearch.toLowerCase()) ||
        a.original_key.toLowerCase().includes(dictSearch.toLowerCase())),
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Tag size={14} style={{ color: "var(--royal-violet)" }} />
          <h3
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--dark-amethyst)" }}
          >
            Atribute Produs
          </h3>
          {entries.length > 0 && (
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full border"
              style={{
                color: "var(--royal-violet)",
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                background:
                  "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
              }}
            >
              {entries.length}
            </span>
          )}
        </div>

        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-md active:scale-95 transition-all disabled:opacity-60"
            style={{ background: "var(--primary-gradient)" }}
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Salvează
          </button>
        )}
      </div>

      {/* ── SUGESTII DIN CATEGORIE ──────────────────────────────────────────── */}
      {suggestedCatKeys.length > 0 && (
        <div
          className="p-4 rounded-2xl border"
          style={{
            background:
              "color-mix(in srgb, var(--royal-violet) 3%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
          }}
        >
          <p
            className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 70%, gray)",
            }}
          >
            <Sparkles size={10} />
            Recomandate pentru această categorie
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedCatKeys.map((key) => (
              <button
                key={key}
                onClick={() => addSuggestedCatAttr(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-[9px] font-bold hover:bg-[var(--royal-violet)] hover:text-white hover:border-transparent transition-all shadow-sm"
                style={{
                  color: "var(--dark-amethyst)",
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
              >
                <Plus size={10} strokeWidth={3} />
                {catAttrs[key]?.label || key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LISTA ATRIBUTE EXISTENTE ────────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, idx) => {
            const catInfo = catAttrs[entry.key];
            const hasPossibleValues =
              catInfo?.possible_values && catInfo.possible_values.length > 0;

            return (
              <motion.div
                key={`${entry.key}-${idx}`}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center gap-3 p-3.5 bg-white border rounded-2xl hover:shadow-sm transition-all"
                style={{
                  borderColor: entry.isNew
                    ? "color-mix(in srgb, var(--royal-violet) 30%, transparent)"
                    : "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  background: entry.isNew
                    ? "color-mix(in srgb, var(--royal-violet) 2%, white)"
                    : undefined,
                }}
              >
                {/* Cheie */}
                <div className="w-1/3 shrink-0">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider truncate block"
                    style={{
                      color: entry.isNew
                        ? "var(--royal-violet)"
                        : "color-mix(in srgb, var(--dark-amethyst) 70%, gray)",
                    }}
                  >
                    {catInfo?.label || entry.key.replace(/_/g, " ")}
                  </span>
                  <span
                    className="text-[8px] font-mono"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                    }}
                  >
                    {entry.key}
                  </span>
                </div>

                {/* Valoare — Dropdown dacă avem valori posibile, altfel input */}
                <div className="flex-1">
                  {hasPossibleValues ? (
                    <select
                      value={entry.value}
                      onChange={(e) => updateValue(idx, e.target.value)}
                      className="w-full bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                      style={{
                        color: "var(--dark-amethyst)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--royal-violet)";
                        e.target.style.backgroundColor = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                        e.target.style.backgroundColor = "rgb(249,250,251)";
                      }}
                    >
                      <option value="">— Selectează —</option>
                      {catInfo!.possible_values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                      {/* Dacă valoarea curentă nu e în lista standard, o păstrăm */}
                      {entry.value &&
                        !catInfo!.possible_values.includes(entry.value) && (
                          <option value={entry.value}>
                            {entry.value} (custom)
                          </option>
                        )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={entry.value}
                      onChange={(e) => updateValue(idx, e.target.value)}
                      placeholder="Valoare atribut..."
                      className="w-full bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all placeholder:font-normal"
                      style={{
                        color: "var(--dark-amethyst)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--royal-violet)";
                        e.target.style.backgroundColor = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                        e.target.style.backgroundColor = "rgb(249,250,251)";
                      }}
                    />
                  )}
                </div>

                {/* Buton ștergere */}
                <button
                  onClick={() => removeEntry(idx)}
                  className="size-8 flex items-center justify-center rounded-xl border bg-white text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  style={{
                    borderColor: "color-mix(in srgb, #f43f5e 20%, transparent)",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {entries.length === 0 && (
          <div
            className="py-10 text-center border border-dashed rounded-2xl"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            <Tag
              size={24}
              strokeWidth={1}
              className="mx-auto mb-2"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
              }}
            />
            <p
              className="text-[9px] font-black uppercase tracking-widest"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
              }}
            >
              Niciun atribut adăugat
            </p>
          </div>
        )}
      </div>

      {/* ── BUTOANE ADĂUGARE ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {/* Din dicționar */}
        <div className="relative">
          <button
            onClick={() => setShowDictDropdown((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            <RefreshCw size={11} />
            Din Dicționar
            <ChevronDown
              size={10}
              style={{
                transform: showDictDropdown ? "rotate(180deg)" : undefined,
                transition: "transform 0.2s",
              }}
            />
          </button>

          {showDictDropdown && (
            <div
              className="absolute top-full left-0 mt-2 w-72 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <div
                className="p-3 border-b"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                }}
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Caută atribut..."
                  value={dictSearch}
                  onChange={(e) => setDictSearch(e.target.value)}
                  className="w-full bg-zinc-50 border rounded-xl px-3 py-2 text-xs outline-none"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {isDictLoading ? (
                  <div className="py-6 text-center">
                    <Loader2
                      size={16}
                      className="animate-spin mx-auto"
                      style={{ color: "var(--royal-violet)" }}
                    />
                  </div>
                ) : filteredDict.length === 0 ? (
                  <p className="py-6 text-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Niciun rezultat
                  </p>
                ) : (
                  filteredDict.map((attr) => (
                    <button
                      key={attr.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addFromDict(attr);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors border-b text-left"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--dark-amethyst)] truncate">
                          {attr.display_label}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-400">
                          {attr.original_key}
                        </p>
                      </div>
                      <Plus
                        size={12}
                        style={{ color: "var(--royal-violet)" }}
                        className="shrink-0"
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual */}
        <button
          onClick={() => setShowManualForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
          style={{
            color: "var(--dark-amethyst)",
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
          }}
        >
          <Plus size={11} />
          Cheie Nouă
        </button>
      </div>

      {/* ── FORMULAR CHEIE MANUALĂ ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 bg-white border rounded-2xl space-y-3"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <p
                className="text-[8px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Atribut Personalizat
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cheie (ex: material_exterior)"
                    value={newKeyRaw}
                    onChange={(e) => setNewKeyRaw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualKey()}
                    className="w-full bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none transition-all"
                    style={{
                      color: "var(--royal-violet)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--royal-violet)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    }}
                  />
                  {newKeyRaw && (
                    <p
                      className="text-[8px] font-mono mt-1 pl-1"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    >
                      → {normalizeKey(newKeyRaw)}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Valoare (opțional acum)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualKey()}
                    className="w-full bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all"
                    style={{
                      color: "var(--dark-amethyst)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--royal-violet)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowManualForm(false);
                    setNewKeyRaw("");
                    setNewValue("");
                  }}
                  className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl bg-zinc-50 border hover:bg-zinc-100 transition-all"
                  style={{
                    color: "var(--dark-amethyst)",
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  Anulează
                </button>
                <button
                  onClick={addManualKey}
                  className="px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl text-white shadow-sm active:scale-95 transition-all"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  Adaugă
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER SAVE ─────────────────────────────────────────────────────── */}
      {isDirty && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-2xl border"
          style={{
            background:
              "color-mix(in srgb, var(--royal-violet) 4%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} style={{ color: "var(--royal-violet)" }} />
            <p
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: "var(--dark-amethyst)" }}
            >
              Modificări nesalvate
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-md active:scale-95 transition-all disabled:opacity-60"
            style={{ background: "var(--primary-gradient)" }}
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Salvează Atributele
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductAttributesEditor;
// ─────────────────────────────────────────────────────────────────────────────
// BulkCategoryAttributesModal.tsx — Modal separat pentru aplicare bulk
// Folosire: <BulkCategoryAttributesModal categoryId={id} categoryName={name} />
// ─────────────────────────────────────────────────────────────────────────────

export const BulkCategoryAttributesModal = ({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [entries, setEntries] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const updateEntry = (idx: number, field: "key" | "value", val: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    );
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    setEntries((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleApply = async () => {
    const clean: Record<string, string> = {};
    for (const e of entries) {
      const k = normalizeKey(e.key);
      if (k && e.value.trim()) clean[k] = e.value.trim();
    }
    if (Object.keys(clean).length === 0) {
      toast.error("Adaugă cel puțin un atribut cu cheie și valoare.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/products/admin/bulk-apply-category-attributes?category_id=${categoryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ default_attributes: clean }),
        },
      );
      if (!res.ok) throw new Error("Eroare server");
      const data = await res.json();
      setResult(data);
      toast.success(
        `${data.updated_products} / ${data.total_in_category} produse actualizate.`,
      );
    } catch (err) {
      toast.error("Eroare la aplicarea atributelor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] shadow-2xl border w-full max-w-lg overflow-hidden"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              Atribute Bulk —{" "}
              <span style={{ color: "var(--royal-violet)" }}>
                {categoryName}
              </span>
            </h2>
            <p className="text-[8px] text-zinc-400 uppercase tracking-widest font-black mt-0.5">
              Aplică pe produsele fără aceste chei (non-destructiv)
            </p>
          </div>
          <button
            onClick={() => {
              onOpenChange(false);
              setResult(null);
            }}
            className="size-8 rounded-full border flex items-center justify-center hover:bg-zinc-50 text-zinc-400"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {result ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2
                size={40}
                className="mx-auto"
                style={{ color: "var(--royal-violet)" }}
              />
              <p className="font-black text-[var(--dark-amethyst)]">
                {result.updated_products} produse actualizate
              </p>
              <p className="text-xs text-zinc-400">
                din {result.total_in_category} total în categorie
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {result.applied_attributes?.map((k: string) => (
                  <span
                    key={k}
                    className="text-[9px] font-mono px-2 py-1 bg-zinc-50 border rounded-lg text-zinc-500"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              {entries.map((e, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="cheie (ex: material)"
                    value={e.key}
                    onChange={(ev) => updateEntry(idx, "key", ev.target.value)}
                    className="flex-1 bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none"
                    style={{
                      color: "var(--royal-violet)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="valoare implicită"
                    value={e.value}
                    onChange={(ev) =>
                      updateEntry(idx, "value", ev.target.value)
                    }
                    className="flex-1 bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                    style={{
                      color: "var(--dark-amethyst)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                  />
                  <button
                    onClick={() => removeEntry(idx)}
                    className="size-8 flex items-center justify-center rounded-xl border text-red-400 hover:bg-red-50 transition-all"
                    style={{
                      borderColor:
                        "color-mix(in srgb, #f43f5e 20%, transparent)",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={addRow}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-zinc-50 border hover:bg-zinc-100 transition-all w-full justify-center"
                style={{
                  color: "var(--dark-amethyst)",
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <Plus size={11} /> Rând Nou
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div
            className="p-5 border-t flex justify-end gap-3"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-zinc-50 border hover:bg-zinc-100 transition-all"
              style={{
                color: "var(--dark-amethyst)",
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              Anulează
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-md active:scale-95 transition-all disabled:opacity-60"
              style={{ background: "var(--primary-gradient)" }}
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Aplică pe Categorie
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
