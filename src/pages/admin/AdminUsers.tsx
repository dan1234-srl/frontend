/**
 * AdminUsers.tsx
 * Pagina de administrare utilizatori - Design Futuristic (Glassmorphism)
 */

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  Trash2,
  ShieldCheck,
  User,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { readCache, writeCache } from "@/lib/swr-cache";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminUsers = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // --- DATA STATE ---
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch stabil cu Cache integrat
  const fetchUsers = useCallback(async () => {
    const cacheKey = `admin:users:p=${page}:q=${searchTerm}:r=${roleFilter}`;
    const cached = readCache<any>(cacheKey, 60_000).data;

    if (cached) {
      setUsers(cached.items || []);
      setTotalPages(cached.pages || 1);
      setTotalItems(cached.total || 0);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        search: searchTerm,
        role_filter: roleFilter === "ALL" ? "" : roleFilter,
      });

      const res = await fetch(`${API_BASE}/api/v1/admin/users?${params}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Eroare la preluarea utilizatorilor");

      const data = await res.json();
      setUsers(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
      writeCache(cacheKey, data);
    } catch (err) {
      if (!cached) toast.error("Eroare la încărcarea utilizatorilor");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, roleFilter]);

  // Declansare automata la schimbarea parametrilor
  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const invalidateAll = useCallback(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("swr:admin:users:")) sessionStorage.removeItem(k);
    }
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });

      if (res.ok) {
        toast.success(`Rang actualizat: ${newRole.toUpperCase()}`);
        invalidateAll();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Eroare la actualizare");
      }
    } catch {
      toast.error("Eroare server");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Utilizator dezactivat");
        invalidateAll();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Eroare la ștergere");
      throw new Error();
    }
  };

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      {/* ── HEADER FUTURISTIC ──────────────────────────────────────────────── */}
      <header
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 pt-4 border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles
              size={12}
              className="animate-pulse"
              style={{ color: "var(--royal-violet)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              Identitate & Securitate
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Management{" "}
            <span style={{ color: "var(--royal-violet)" }}>Membri</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              size={15}
              style={{
                color:
                  "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
              }}
            />
            <input
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-xl border rounded-xl outline-none transition-all text-sm font-medium placeholder:font-normal"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                color: "var(--dark-amethyst)",
                boxShadow:
                  "0 4px 20px -10px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
              placeholder="Caută utilizator (nume, email)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--royal-violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor =
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)")
              }
            />
          </div>
        </div>
      </header>

      {/* ── FILTERS BAR (Glassmorphism) ──────────────────────────── */}
      <section
        className="flex items-center gap-3 p-3 rounded-2xl backdrop-blur-xl border bg-white/40 overflow-x-auto no-scrollbar w-fit"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        {[
          { label: "Toți Membrii", val: "ALL" },
          { label: "Administratori", val: "ADMIN" },
          { label: "Clienți Retail", val: "USER" },
        ].map((f) => {
          const active = roleFilter === f.val;
          return (
            <button
              key={f.val}
              onClick={() => {
                setRoleFilter(f.val);
                setPage(1);
              }}
              className={`relative px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm shrink-0 ${
                active
                  ? "text-white border-transparent"
                  : "text-zinc-500 hover:text-[var(--dark-amethyst)] bg-white border"
              }`}
              style={{
                borderColor: !active
                  ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                  : undefined,
              }}
            >
              {active && (
                <motion.span
                  layoutId="users-filter-chip"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--primary-gradient)" }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          );
        })}
      </section>

      {/* ── DATA GRID MODERN ─────────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border overflow-hidden relative z-10 min-h-[500px]"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        {/* Header Listă */}
        <div
          className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
          }}
        >
          <div className="col-span-4 pl-2">Identitate Utilizator</div>
          <div className="col-span-2">Rang Sistem</div>
          <div className="col-span-3">Dată Înregistrare</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right pr-4">Gestiune</div>
        </div>

        <div
          className="divide-y"
          style={{
            divideColor:
              "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              // Skeleton Loader
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-10 py-5 items-start md:items-center gap-4 md:gap-0 border-b last:border-0"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                    }}
                  >
                    <div className="col-span-4 flex items-center gap-4 w-full">
                      <Skeleton className="size-11 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-24" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="col-span-3">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2 md:mx-auto">
                      <Skeleton className="h-3 w-10 rounded-full" />
                    </div>
                    <div className="col-span-1 md:ml-auto">
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : users.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center gap-3"
              >
                <AlertTriangle
                  size={40}
                  strokeWidth={1}
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                  }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                >
                  Niciun profil identificat
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {users.map((u) => (
                  <div key={u.id} className="group relative transition-all">
                    {/* Hover Fill Gradient (Invizibil în mod normal) */}
                    <div
                      className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                      style={{
                        background:
                          "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                      }}
                    />

                    <div
                      className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-4 relative z-10 gap-4 md:gap-0 border-b last:border-0"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                      }}
                    >
                      {/* Identitate */}
                      <div className="col-span-4 flex items-center gap-4 w-full pl-2">
                        <div
                          className="size-11 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-sm uppercase group-hover:scale-105 transition-transform duration-500 shrink-0"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          {u.first_name?.[0] || ""}
                          {u.last_name?.[0] ||
                            (!u.first_name && <User size={14} />)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold tracking-tight uppercase text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors truncate">
                            {u.first_name} {u.last_name}
                          </span>
                          <span
                            className="text-[9px] font-semibold lowercase tracking-widest mt-0.5 truncate"
                            style={{
                              color:
                                "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                            }}
                          >
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {/* Rang */}
                      <div className="col-span-2 pl-2 md:pl-0">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm whitespace-nowrap"
                          style={{
                            backgroundColor:
                              u.role === "admin"
                                ? "var(--dark-amethyst)"
                                : "white",
                            color:
                              u.role === "admin"
                                ? "white"
                                : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                            borderColor:
                              u.role === "admin"
                                ? "transparent"
                                : "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          {u.role === "admin" ? (
                            <Shield size={10} strokeWidth={2.5} />
                          ) : (
                            <User size={10} strokeWidth={2.5} />
                          )}
                          {u.role}
                        </span>
                      </div>

                      {/* Dată */}
                      <div
                        className="col-span-3 text-[10px] font-bold uppercase tracking-wider pl-2 md:pl-0"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                        }}
                      >
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "---"}
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-start md:justify-center w-full pl-2 md:pl-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${u.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-zinc-300"}`}
                          />
                          <span
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{
                              color: u.is_active
                                ? "#10b981"
                                : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                            }}
                          >
                            {u.is_active ? "LIVE" : "BAN"}
                          </span>
                        </div>
                      </div>

                      {/* Acțiuni (Gestiune) */}
                      <div className="col-span-1 flex justify-end w-full md:w-auto pr-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-full hover:bg-white hover:shadow-md transition-all border"
                              style={{
                                color: "var(--dark-amethyst)",
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              }}
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 p-2 rounded-2xl border-zinc-100 shadow-2xl bg-white"
                          >
                            <DropdownMenuLabel
                              className="text-[9px] font-black uppercase tracking-widest px-3 py-2"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              }}
                            >
                              Contact Membru
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-zinc-50" />
                            <DropdownMenuLabel
                              className="text-[9px] font-black uppercase tracking-widest px-3 py-2"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              }}
                            >
                              Privilegii Sistem
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateRole(
                                  u.id,
                                  u.role === "admin" ? "user" : "admin",
                                )
                              }
                              className="rounded-xl gap-3 py-3 cursor-pointer text-xs font-bold focus:bg-zinc-50"
                              style={{ color: "var(--royal-violet)" }}
                            >
                              <ShieldCheck size={14} />
                              {u.role === "admin"
                                ? "Revocă Drepturi Admin"
                                : "Promovează la Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-50" />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${page === i + 1 ? "text-white border-transparent" : "bg-white hover:bg-zinc-50"}`}
                  style={{
                    background:
                      page === i + 1 ? "var(--primary-gradient)" : undefined,
                    borderColor:
                      page !== i + 1
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color:
                      page !== i + 1
                        ? "var(--dark-amethyst)"
                        : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  {i + 1}
                </button>
              ))
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
          </div>

          <span
            className="sm:hidden text-[10px] font-black uppercase tracking-[0.2em] bg-white border px-4 py-2 rounded-xl shadow-sm"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            {page} <span className="opacity-30 mx-1">/</span> {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronRight size={14} style={{ color: "var(--royal-violet)" }} />
          </button>
        </div>
      )}

      {/* ── MODAL DE CONFIRMARE ȘTERGERE ── */}
      <AdminConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        eyebrow="Avertisment Securitate"
        title="Suspendezi acest utilizator?"
        description="Contul va fi dezactivat și nu se va mai putea autentifica pe platformă. Acțiunea poate fi reversată ulterior doar de un alt administrator."
        confirmLabel="Confirmă Suspendarea"
        destructive
        onConfirm={async () => {
          if (confirmDeleteId) await handleDeleteUser(confirmDeleteId);
        }}
      />
    </div>
  );
};

export default AdminUsers;
