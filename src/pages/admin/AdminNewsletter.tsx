import { useState } from "react";
import {
  Send,
  Users,
  MailOpen,
  MousePointer2,
  Search,
  Download,
  UserMinus,
  Mail,
  ChevronLeft,
  ChevronRight,
  Activity,
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
import { toast } from "sonner";
import { motion } from "framer-motion";

const MOCK_SUBSCRIBERS = [
  {
    id: 1,
    email: "client.premium@yahoo.com",
    name: "Elena Popescu",
    date: "15 Mar 2026",
    source: "Popup Homepage",
    status: "Subscris",
  },
  {
    id: 2,
    email: "andrei.ionescu@gmail.com",
    name: "Andrei Ionescu",
    date: "12 Mar 2026",
    source: "Checkout",
    status: "Subscris",
  },
  {
    id: 3,
    email: "m.radu@outlook.com",
    name: "Maria Radu",
    date: "10 Mar 2026",
    source: "Footer",
    status: "Unsubscribed",
  },
  {
    id: 4,
    email: "office@business.ro",
    name: "Cristian Stan",
    date: "05 Mar 2026",
    source: "Popup Homepage",
    status: "Subscris",
  },
  {
    id: 5,
    email: "anca.d@jewelry.com",
    name: "Anca Dumitru",
    date: "01 Mar 2026",
    source: "Manual",
    status: "Subscris",
  },
];

const AdminNewsletter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("Toate");

  const handleSendCampaign = () => {
    toast.promise(new Promise((res) => setTimeout(res, 2000)), {
      loading: "Se pregătește expedierea...",
      success: "Campania a fost trimisă!",
      error: "Eroare la trimitere.",
    });
  };

  const filtered = MOCK_SUBSCRIBERS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSource = sourceFilter === "Toate" || s.source === sourceFilter;
    return matchSearch && matchSource;
  });

  return (
    <div className="space-y-10 pb-16 text-left font-sans animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-10">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg text-white"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Activity size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--royal-violet)]">
            Email Marketing
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-[var(--dark-amethyst)]">
            Newsletter
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-zinc-200 text-[10px] uppercase tracking-widest h-12 px-6 gap-2 text-[var(--dark-amethyst)] hover:border-[var(--royal-violet)]"
            >
              <Download size={14} /> Export CSV
            </Button>
            <button
              onClick={handleSendCampaign}
              className="rounded-xl text-white text-[10px] font-black uppercase tracking-widest h-12 px-8 gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Send size={16} /> Trimite Campanie
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Abonați",
            value: "1,284",
            icon: <Users size={18} />,
            trend: "+12 luna asta",
          },
          {
            label: "Rată Deschidere",
            value: "24.8%",
            icon: <MailOpen size={18} />,
            trend: "Peste medie",
            color: "var(--royal-violet)",
          },
          {
            label: "Click-through",
            value: "8.2%",
            icon: <MousePointer2 size={18} />,
            trend: "Standard",
            color: "#10b981",
          },
          {
            label: "Dezabonări",
            value: "3",
            icon: <UserMinus size={18} />,
            trend: "Scădere -2%",
            color: "#f43f5e",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-zinc-100 p-6 shadow-sm rounded-[2rem] group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
                {item.label}
              </span>
              <div
                className="transition-colors"
                style={{ color: item.color || "var(--dark-amethyst)" }}
              >
                {item.icon}
              </div>
            </div>
            <h4 className="text-2xl font-serif italic text-[var(--dark-amethyst)] tracking-tighter">
              {item.value}
            </h4>
            <p className="text-[8px] uppercase text-zinc-300 mt-2 font-bold tracking-widest">
              {item.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-100 p-4 shadow-sm rounded-[1.5rem] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
            size={16}
          />
          <Input
            placeholder="CAUTĂ ABONAT..."
            className="pl-12 rounded-xl border-zinc-50 bg-zinc-50/50 text-[10px] uppercase tracking-widest h-12 focus:ring-2 focus:ring-[var(--royal-violet)]/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-12 border border-zinc-100 bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest px-6 outline-none rounded-xl text-[var(--dark-amethyst)]"
        >
          <option value="Toate">Toate Sursele</option>
          <option>Popup Homepage</option>
          <option>Checkout</option>
          <option>Footer</option>
          <option>Manual</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden rounded-[2rem]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-b border-zinc-100">
                <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400 px-10 py-6">
                  Abonat
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400 hidden md:table-cell">
                  Email
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400 hidden lg:table-cell">
                  Data
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400 hidden md:table-cell">
                  Sursă
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400 text-center">
                  Status
                </TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest font-black text-zinc-400 px-10">
                  Acțiuni
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow
                  key={sub.id}
                  className="group border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <TableCell className="px-10 py-5 font-bold text-sm text-[var(--dark-amethyst)] uppercase tracking-tight">
                    {sub.name}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--royal-violet)] font-medium italic hidden md:table-cell">
                    {sub.email}
                  </TableCell>
                  <TableCell className="text-[10px] text-zinc-400 uppercase font-bold hidden lg:table-cell">
                    {sub.date}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[9px] uppercase tracking-widest bg-zinc-100 px-3 py-1 text-zinc-500 rounded-lg font-black">
                      {sub.source}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-3 py-1 text-[8px] uppercase tracking-widest font-black border rounded-full shadow-sm ${
                        sub.status === "Subscris"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-zinc-100 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-zinc-300 hover:text-[var(--dark-amethyst)] hover:bg-white border border-transparent hover:border-zinc-100"
                      >
                        <Mail size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-zinc-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                      >
                        <UserMinus size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black">
          Afișare <span className="text-[var(--dark-amethyst)]">1-5</span> din{" "}
          <span className="text-[var(--dark-amethyst)]">1,284</span>
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
          >
            <ChevronLeft size={18} />
          </Button>
          <button
            className="h-10 min-w-[40px] rounded-xl text-[10px] font-black text-white shadow-lg"
            style={{ background: "var(--primary-gradient)" }}
          >
            1
          </button>
          <Button
            variant="ghost"
            className="h-10 min-w-[40px] rounded-xl text-[10px] font-black text-zinc-400 hover:text-[var(--dark-amethyst)]"
          >
            2
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
