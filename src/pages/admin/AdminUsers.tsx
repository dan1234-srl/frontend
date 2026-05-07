import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  UserPlus,
  MoreHorizontal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  Trash2,
  UserCog,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        search: searchTerm,
        role_filter: roleFilter,
      });

      const res = await fetch(`${API_BASE}/api/v1/admin/users?${params}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Eroare la preluarea utilizatorilor");

      const data = await res.json();
      setUsers(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      toast.error("Sincronizarea bazei de date a eșuat");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, roleFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchUsers, 400);
    return () => clearTimeout(delayDebounce);
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
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Eroare la actualizare");
      }
    } catch (err) {
      toast.error("Eroare server");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Sigur dorești să dezactivezi acest cont?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Utilizator dezactivat");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Eroare la ștergere");
    }
  };

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER LUXURY */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-zinc-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-[1px]"
              style={{ backgroundColor: "var(--royal-violet)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.5em]"
              style={{ color: "var(--royal-violet)" }}
            >
              Identitate & Securitate
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Management{" "}
            <span style={{ color: "var(--royal-violet)" }}>Membri</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
              size={18}
            />
            <input
              className="w-full sm:w-[350px] pl-12 pr-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--royal-violet)]/10 outline-none transition-all text-sm font-bold shadow-inner"
              placeholder="Identifică utilizator..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <UserPlus size={16} /> Invită Membru
          </button>
        </div>
      </header>

      {/* FILTERS BAR */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {[
          { label: "Toți Membrii", val: "ALL" },
          { label: "Administratori", val: "ADMIN" },
          { label: "Clienți Retail", val: "USER" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => {
              setRoleFilter(f.val);
              setPage(1);
            }}
            className={`px-6 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all border shrink-0 ${
              roleFilter === f.val
                ? "text-white border-transparent shadow-md"
                : "bg-white text-zinc-400 border-zinc-100 hover:border-[var(--royal-violet)]"
            }`}
            style={{
              backgroundColor:
                roleFilter === f.val ? "var(--dark-amethyst)" : undefined,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden relative min-h-[500px]">
        <Table className="w-full">
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="py-6 px-10 text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Identitate Utilizator
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Rang Sistem
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Înregistrare
              </TableHead>
              <TableHead className="text-center text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Status
              </TableHead>
              <TableHead className="text-right px-10 text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Gestiune
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="size-11 rounded-2xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-7 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3 w-3 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="px-10 text-right">
                      <Skeleton className="size-10 ml-auto rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-32 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest"
                  >
                    Niciun profil identificat conform filtrării.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={u.id}
                    className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-50/50 last:border-0"
                  >
                    <TableCell className="py-6 px-10">
                      <div className="flex items-center gap-4">
                        <div
                          className="size-11 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-md uppercase transition-all"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          {u.first_name?.[0] || ""}
                          {u.last_name?.[0] || <User size={14} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[var(--dark-amethyst)] uppercase tracking-tight">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium lowercase italic">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm ${
                          u.role === "admin"
                            ? "bg-[var(--dark-amethyst)] text-white border-transparent"
                            : "bg-white text-zinc-500 border-zinc-200"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield size={10} strokeWidth={3} />
                        ) : (
                          <User size={10} />
                        )}
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`size-2 rounded-full ${u.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-zinc-300"}`}
                        />
                        <span className="text-[8px] font-black uppercase text-zinc-300">
                          {u.is_active ? "LIVE" : "BAN"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-white hover:shadow-md transition-all text-zinc-400 hover:text-[var(--dark-amethyst)]"
                          >
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 p-2 rounded-2xl border-zinc-100 shadow-2xl"
                        >
                          <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-400 px-3 py-2">
                            Contact Membru
                          </DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                            <Mail size={14} /> Trimite Mesaj Direct
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-50" />
                          <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-400 px-3 py-2">
                            Privilegii Sistem
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(
                                u.id,
                                u.role === "admin" ? "user" : "admin",
                              )
                            }
                            className="rounded-xl gap-3 py-3 cursor-pointer font-bold"
                            style={{ color: "var(--royal-violet)" }}
                          >
                            <ShieldCheck size={14} />{" "}
                            {u.role === "admin"
                              ? "Elimină Acces Admin"
                              : "Acordă Acces Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-50" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-xl gap-3 py-3 cursor-pointer text-rose-500 font-bold focus:bg-rose-50 focus:text-rose-600"
                          >
                            <Trash2 size={14} /> Suspendă Contul
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {totalPages > 1 && !loading && (
          <footer className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Total Database Hub:{" "}
              <span style={{ color: "var(--royal-violet)" }}>
                {totalItems} profile
              </span>
            </span>
            <div className="flex items-center gap-4 mx-auto sm:mx-0">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 hover:border-[var(--royal-violet)] disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center min-w-24">
                <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">
                  Pagina
                </p>
                <p className="heading-serif text-2xl italic font-bold text-[var(--dark-amethyst)]">
                  {page}{" "}
                  <span className="text-xs font-sans text-zinc-300 not-italic">
                    / {totalPages}
                  </span>
                </p>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 hover:border-[var(--royal-violet)] disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
