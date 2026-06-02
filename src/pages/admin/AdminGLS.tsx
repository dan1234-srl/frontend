import { useState } from "react";
import {
  Truck,
  Search,
  Trash2,
  RotateCcw,
  MapPin,
  PackagePlus,
  Loader2,
  Copy,
  Activity,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  GLS_STATUS_MAP,
  getStatusMeta,
} from "@/lib/gls-status-codes";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const PICKUP_LOCATIONS = [
  { value: "suceava", label: "Suceava (Default)" },
  { value: "bucuresti", label: "București" },
  { value: "cluj", label: "Cluj-Napoca" },
];

async function apiCall(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: any) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white/70 backdrop-blur-xl border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_-12px_rgba(16,0,43,0.06)]"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="size-11 rounded-2xl bg-[var(--royal-violet)]/10 flex items-center justify-center text-[var(--royal-violet)] shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">{description}</p>
        )}
      </div>
    </div>
    {children}
  </motion.section>
);

const Field = ({ label, children }: any) => (
  <label className="block">
    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">
      {label}
    </span>
    {children}
  </label>
);

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/30 focus:border-[var(--royal-violet)] transition-all";

const btnPrimary =
  "h-11 px-5 rounded-xl bg-[var(--royal-violet)] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50";

const btnGhost =
  "h-11 px-5 rounded-xl bg-zinc-100 text-zinc-800 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50";

const StatusTimeline = ({ statuses }: { statuses: any[] }) => {
  if (!statuses?.length) {
    return (
      <p className="text-xs text-zinc-400 italic">Niciun status disponibil.</p>
    );
  }
  return (
    <ol className="relative border-l-2 border-zinc-100 pl-5 space-y-4">
      {statuses.map((s: any, i: number) => {
        const code = s.StatusCode ?? s.code;
        const meta = getStatusMeta(code);
        const Icon = meta.icon;
        const ts = s.StatusDate || s.Date || s.timestamp;
        return (
          <li key={i} className="relative">
            <span
              className="absolute -left-[27px] size-4 rounded-full border-2 border-white shadow flex items-center justify-center"
              style={{ background: meta.color }}
            >
              <Icon size={8} className="text-white" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                style={{ background: meta.color }}
              >
                {meta.label}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                #{code}
              </span>
            </div>
            <p className="text-xs text-zinc-700 mt-1">
              {s.StatusDescription || s.description || meta.description}
            </p>
            {ts && (
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {new Date(ts).toLocaleString("ro-RO")}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

const AdminGLS = () => {
  // ── Track single AWB
  const [awbInput, setAwbInput] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any[] | null>(null);

  // ── Bulk track
  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any[] | null>(null);

  // ── Delete parcel
  const [delId, setDelId] = useState("");
  const [delLoading, setDelLoading] = useState(false);

  // ── Lockers
  const [lockers, setLockers] = useState<any[] | null>(null);
  const [lockersLoading, setLockersLoading] = useState(false);
  const [lockerFilter, setLockerFilter] = useState("");

  // ── Create AWB
  const [orderId, setOrderId] = useState("");
  const [pickup, setPickup] = useState("suceava");
  const [isLocker, setIsLocker] = useState(false);
  const [lockerMatchcode, setLockerMatchcode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);

  // ── Return AWB
  const [returnOrderId, setReturnOrderId] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnResult, setReturnResult] = useState<any>(null);

  const handleTrack = async () => {
    if (!awbInput.trim()) return toast.error("Introdu un număr AWB.");
    setTrackLoading(true);
    setTrackResult(null);
    try {
      const data = await apiCall(
        `/api/v1/admin/gls/parcel/${awbInput.trim()}/statuses`,
      );
      setTrackResult(data.statuses || data.ParcelStatusList || data || []);
      toast.success("Statusuri actualizate.");
    } catch (e: any) {
      toast.error("Eroare la tracking", { description: e.message });
    } finally {
      setTrackLoading(false);
    }
  };

  const handleBulkTrack = async () => {
    const nums = bulkInput
      .split(/[\s,;\n]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (!nums.length) return toast.error("Introdu cel puțin un AWB.");
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const data = await apiCall(`/api/v1/admin/gls/parcels/statuses`, {
        method: "POST",
        body: JSON.stringify({ parcel_numbers: nums.map(Number) }),
      });
      setBulkResult(data.parcels || data.ParcelList || []);
      toast.success(`${nums.length} colete verificate.`);
    } catch (e: any) {
      toast.error("Eroare bulk tracking", { description: e.message });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!delId.trim()) return toast.error("Introdu ID-ul coletului.");
    if (!confirm(`Ștergi AWB-ul cu Parcel ID ${delId}?`)) return;
    setDelLoading(true);
    try {
      await apiCall(`/api/v1/admin/gls/parcel/${delId.trim()}`, {
        method: "DELETE",
      });
      toast.success("AWB șters din GLS.");
      setDelId("");
    } catch (e: any) {
      toast.error("Eroare ștergere", { description: e.message });
    } finally {
      setDelLoading(false);
    }
  };

  const handleLoadLockers = async () => {
    setLockersLoading(true);
    try {
      const data = await apiCall(`/api/v1/admin/gls/delivery-points`);
      const list = Array.isArray(data) ? data : data.points || [];
      setLockers(list);
      toast.success(`${list.length} lockere încărcate.`);
    } catch (e: any) {
      toast.error("Eroare la încărcare lockere", { description: e.message });
    } finally {
      setLockersLoading(false);
    }
  };

  const handleCreateAwb = async () => {
    if (!orderId.trim()) return toast.error("Introdu ID-ul comenzii.");
    if (isLocker && !lockerMatchcode.trim())
      return toast.error("Locker selectat: introdu matchcode-ul.");
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const data = await apiCall(`/api/v1/admin/gls/create-awb`, {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId.trim(),
          pickup_location: pickup,
          is_locker: isLocker,
          locker_matchcode: lockerMatchcode.trim() || null,
        }),
      });
      setCreateResult(data);
      toast.success(`AWB generat: ${data.parcel_number || "OK"}`);
    } catch (e: any) {
      toast.error("Eroare la generare AWB", { description: e.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateReturn = async () => {
    if (!returnOrderId.trim()) return toast.error("Introdu ID-ul comenzii.");
    setReturnLoading(true);
    setReturnResult(null);
    try {
      const data = await apiCall(`/api/v1/admin/gls/create-return`, {
        method: "POST",
        body: JSON.stringify({ order_id: returnOrderId.trim() }),
      });
      setReturnResult(data);
      toast.success(`AWB retur generat: ${data.parcel_number || "OK"}`);
    } catch (e: any) {
      toast.error("Eroare la retur", { description: e.message });
    } finally {
      setReturnLoading(false);
    }
  };

  const filteredLockers = lockers?.filter((l) => {
    if (!lockerFilter.trim()) return true;
    const q = lockerFilter.toLowerCase();
    return (
      (l.Name || l.name || "").toLowerCase().includes(q) ||
      (l.City || l.city || "").toLowerCase().includes(q) ||
      (l.Matchcode || l.matchcode || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-[var(--royal-violet)] to-[var(--french-blue,#3b82f6)] flex items-center justify-center text-white shadow-lg">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              GLS România · Atelier Logistic
            </p>
            <h1 className="heading-serif text-3xl font-bold text-zinc-950">
              Operațiuni Curierat
            </h1>
          </div>
        </div>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Centru de control pentru integrarea GLS: generare AWB, tracking,
          retururi, lockere și ștergere colete.
        </p>
      </header>

      {/* TRACK */}
      <Section
        icon={Search}
        title="Tracking AWB"
        description="Vezi statusurile detaliate pentru un colet după numărul AWB."
      >
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={awbInput}
            onChange={(e) => setAwbInput(e.target.value)}
            placeholder="Ex: 70123456789"
            className={inputClass + " md:flex-1"}
          />
          <button
            onClick={handleTrack}
            disabled={trackLoading}
            className={btnPrimary}
          >
            {trackLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Activity size={14} />
            )}
            Verifică
          </button>
        </div>
        {trackResult && (
          <div className="mt-6 p-5 bg-zinc-50/60 rounded-2xl border border-zinc-100">
            <StatusTimeline statuses={trackResult} />
          </div>
        )}
      </Section>

      {/* BULK TRACK */}
      <Section
        icon={ListChecks}
        title="Tracking Multiplu"
        description="Verifică simultan până la 100 de colete (separate prin virgulă sau enter)."
      >
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder="70123456789, 70123456790, 70123456791..."
          rows={3}
          className={inputClass.replace("h-11", "min-h-[88px] py-3")}
        />
        <div className="mt-3 flex gap-3">
          <button
            onClick={handleBulkTrack}
            disabled={bulkLoading}
            className={btnPrimary}
          >
            {bulkLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ListChecks size={14} />
            )}
            Verifică Lot
          </button>
        </div>
        {bulkResult && (
          <div className="mt-6 space-y-3">
            {bulkResult.map((p: any, i: number) => {
              const last =
                p.ParcelStatusList?.[p.ParcelStatusList.length - 1] || p;
              const meta = getStatusMeta(last.StatusCode ?? p.status_code);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-xl"
                >
                  <span className="font-mono text-xs">
                    {p.ParcelNumber || p.parcel_number}
                  </span>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md text-white"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* CREATE AWB */}
      <Section
        icon={PackagePlus}
        title="Generează AWB"
        description="Creează etichetă GLS pentru o comandă existentă. Pentru locker, completează matchcode-ul."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ID Comandă">
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={inputClass}
              placeholder="uuid sau order_number"
            />
          </Field>
          <Field label="Locație Pickup">
            <select
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className={inputClass}
            >
              {PICKUP_LOCATIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tip Livrare">
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setIsLocker(false)}
                className={`flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  !isLocker
                    ? "bg-[var(--royal-violet)] text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                Curier
              </button>
              <button
                type="button"
                onClick={() => setIsLocker(true)}
                className={`flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  isLocker
                    ? "bg-[var(--royal-violet)] text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                Locker
              </button>
            </div>
          </Field>
          {isLocker && (
            <Field label="Locker Matchcode">
              <input
                value={lockerMatchcode}
                onChange={(e) => setLockerMatchcode(e.target.value)}
                className={inputClass}
                placeholder="ex: SVPL01"
              />
            </Field>
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleCreateAwb}
            disabled={createLoading}
            className={btnPrimary}
          >
            {createLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <PackagePlus size={14} />
            )}
            Generează AWB
          </button>
        </div>
        {createResult && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs space-y-1">
            <p>
              <span className="font-black">Parcel Number:</span>{" "}
              <span className="font-mono">{createResult.parcel_number}</span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(String(createResult.parcel_number))
                }
                className="ml-2 text-[var(--royal-violet)]"
              >
                <Copy size={11} className="inline" />
              </button>
            </p>
            <p>
              <span className="font-black">Parcel ID:</span>{" "}
              <span className="font-mono">{createResult.parcel_id}</span>
            </p>
            {createResult.labels_pdf_url && (
              <a
                href={createResult.labels_pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--royal-violet)] underline"
              >
                Descarcă eticheta PDF
              </a>
            )}
          </div>
        )}
      </Section>

      {/* RETURN */}
      <Section
        icon={RotateCcw}
        title="AWB Retur"
        description="Generează AWB de retur — curierul ridică coletul de la client și îl aduce la depozit."
      >
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={returnOrderId}
            onChange={(e) => setReturnOrderId(e.target.value)}
            placeholder="ID Comandă"
            className={inputClass + " md:flex-1"}
          />
          <button
            onClick={handleCreateReturn}
            disabled={returnLoading}
            className={btnPrimary}
          >
            {returnLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            Generează Retur
          </button>
        </div>
        {returnResult && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs">
            AWB Retur:{" "}
            <span className="font-mono font-black">
              {returnResult.parcel_number}
            </span>
          </div>
        )}
      </Section>

      {/* DELETE */}
      <Section
        icon={Trash2}
        title="Șterge AWB"
        description="Anulează un colet din GLS (înainte de ridicare). Necesită Parcel ID."
      >
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={delId}
            onChange={(e) => setDelId(e.target.value)}
            placeholder="Parcel ID"
            className={inputClass + " md:flex-1"}
          />
          <button
            onClick={handleDelete}
            disabled={delLoading}
            className="h-11 px-5 rounded-xl bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {delLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Șterge
          </button>
        </div>
      </Section>

      {/* LOCKERS */}
      <Section
        icon={MapPin}
        title="Lockere GLS România"
        description="Lista actualizată a punctelor de livrare (parcel lockers)."
      >
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <button
            onClick={handleLoadLockers}
            disabled={lockersLoading}
            className={btnGhost}
          >
            {lockersLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MapPin size={14} />
            )}
            {lockers ? "Reîncarcă" : "Încarcă Lockere"}
          </button>
          {lockers && (
            <input
              value={lockerFilter}
              onChange={(e) => setLockerFilter(e.target.value)}
              placeholder="Filtrează după oraș, nume, matchcode..."
              className={inputClass + " md:flex-1"}
            />
          )}
        </div>
        {filteredLockers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2">
            {filteredLockers.slice(0, 200).map((l: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white border border-zinc-100 rounded-xl hover:border-[var(--royal-violet)]/30 transition-all"
              >
                <p className="text-xs font-black text-zinc-900 truncate">
                  {l.Name || l.name || "Locker"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 truncate">
                  {l.City || l.city}, {l.Street || l.street}
                </p>
                {(l.Matchcode || l.matchcode) && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono text-zinc-400">
                      {l.Matchcode || l.matchcode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(l.Matchcode || l.matchcode);
                        toast.success("Matchcode copiat");
                      }}
                      className="text-[var(--royal-violet)]"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredLockers.length > 200 && (
              <p className="text-[10px] text-zinc-400 col-span-full text-center">
                Afișate primele 200 din {filteredLockers.length}.
              </p>
            )}
          </div>
        )}
      </Section>

      {/* Legenda statusuri */}
      <Section
        icon={Activity}
        title="Legendă Coduri Status GLS"
        description="Maparea oficială GLS folosită în tracking."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(GLS_STATUS_MAP)
            .slice(0, 36)
            .map(([code, meta]: any) => {
              const Icon = meta.icon;
              return (
                <div
                  key={code}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-100"
                >
                  <span
                    className="size-6 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ background: meta.color }}
                  >
                    <Icon size={11} />
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 w-6">
                    {code}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-700 truncate">
                    {meta.label}
                  </span>
                </div>
              );
            })}
        </div>
      </Section>
    </div>
  );
};

export default AdminGLS;
