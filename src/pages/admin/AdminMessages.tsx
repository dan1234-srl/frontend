import { useState } from "react";
import {
  Mail, MailOpen, Search, Reply, Trash2, Archive,
  Clock, ChevronLeft, ChevronRight, AlertCircle, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MOCK_MESSAGES = [
  { id: 1, sender: "Ioana Vasilescu", email: "ioana.v@gmail.com", subject: "Întrebare despre mărime inel", message: "Bună ziua, am văzut inelul Pantheon și aș vrea să știu dacă se poate realiza pe mărimea 52.", date: "Azi, 10:45", status: "Nou", category: "Suport Produs" },
  { id: 2, sender: "Marius Ardelean", email: "marius.a@office.ro", subject: "Colaborare B2B", message: "Suntem interesați de o colaborare pentru cadouri corporate. Putem stabili o întâlnire?", date: "Ieri, 16:20", status: "Citit", category: "Parteneriate" },
  { id: 3, sender: "Elena Popa", email: "elena.popa@yahoo.com", subject: "Status comandă #92834", message: "Comanda mea figurează ca fiind în procesare de 2 zile. Când va fi expediată?", date: "20 Mar 2026", status: "Răspuns", category: "Comenzi" },
];

const AdminMessages = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedCategory, setSelectedCategory] = useState("Toate");

  const handleDelete = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.error("Mesaj șters definitiv.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nou": return "bg-[#0A192F] text-white";
      case "Citit": return "bg-blue-50 text-blue-900/50";
      case "Răspuns": return "bg-emerald-50 text-emerald-600 border-emerald-100 border";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const filtered = messages.filter((m) => selectedCategory === "Toate" || m.category === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-blue-100/50 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0A192F] rounded-sm"><Activity size={14} className="text-white" /></div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#0A192F]">Comunicare</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-serif italic tracking-tighter text-[#0A192F]">Mesaje Contact</h1>
          <Button variant="outline" className="rounded-sm border-blue-100 text-[9px] uppercase tracking-widest h-10 px-6 gap-2 text-[#0A192F] hover:bg-[#0A192F] hover:text-white">
            <Archive size={14} /> Arhivă
          </Button>
        </div>
      </div>

      {/* Inbox */}
      <div className="bg-white border border-blue-100/50 shadow-sm rounded-sm">
        <div className="p-4 border-b border-blue-50 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={14} />
            <Input placeholder="CAUTĂ ÎN MESAJE..." className="pl-9 rounded-sm border-blue-100 text-[10px] uppercase tracking-widest h-9" />
          </div>
          <div className="flex gap-3 flex-wrap">
            {["Toate", "Suport Produs", "Comenzi", "Parteneriate"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[9px] uppercase tracking-widest font-bold pb-1 border-b-2 transition-all ${
                  selectedCategory === cat ? "border-[#0A192F] text-[#0A192F]" : "border-transparent text-blue-900/30 hover:text-[#0A192F]"
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-blue-50/50">
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 md:p-6 flex flex-col lg:flex-row gap-4 hover:bg-blue-50/20 transition-colors group ${msg.status === "Nou" ? "bg-blue-50/10" : ""}`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${msg.status === "Nou" ? "bg-[#0A192F]" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-tight text-[#0A192F]">{msg.sender}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest ${getStatusColor(msg.status)}`}>{msg.status}</span>
                    <span className="text-[9px] text-blue-900/30 font-medium flex items-center gap-1 ml-auto">
                      <Clock size={10} /> {msg.date}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-semibold text-[#0A192F] mb-1">{msg.subject}</h4>
                  <p className="text-[11px] text-blue-900/40 line-clamp-1 font-light italic">{msg.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="outline" size="sm" className="h-8 rounded-sm border-blue-100 text-[9px] uppercase tracking-widest gap-2 hover:bg-[#0A192F] hover:text-white">
                  <Reply size={12} /> Răspunde
                </Button>
                <Button onClick={() => handleDelete(msg.id)} variant="ghost" size="icon" className="h-8 w-8 text-blue-200 hover:text-rose-500">
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-blue-900/30 uppercase tracking-widest font-medium">1-3 din 12 mesaje</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-sm border-blue-100"><ChevronLeft size={16} /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-sm border-blue-100"><ChevronRight size={16} /></Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#0A192F] p-5 md:p-6 text-white flex items-center gap-5 rounded-sm">
        <div className="p-3 bg-white/5 rounded-sm"><AlertCircle size={20} strokeWidth={1.5} /></div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold mb-1">Timp de răspuns recomandat</p>
          <p className="text-[11px] font-light opacity-60">Răspunde mesajelor în mai puțin de 4 ore pentru un scor ridicat de satisfacție.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
