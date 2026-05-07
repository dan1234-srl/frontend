import { useState } from "react";
import {
  FileText, Plus, Edit3, ExternalLink, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminPages = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-blue-100/50 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0A192F] rounded-sm"><Activity size={14} className="text-white" /></div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#0A192F]">Conținut Static</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-serif italic tracking-tighter text-[#0A192F]">Pagini</h1>
          <Button className="rounded-sm bg-[#0A192F] hover:bg-blue-900 text-[10px] uppercase tracking-widest h-10 px-6 gap-2 text-white">
            <Plus size={16} /> Creează Pagină
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {["Despre Noi", "Politica de Cookies", "Ghid Mărimi", "Termeni & Condiții"].map((page, i) => (
          <div key={i} className="bg-white border border-blue-100/50 p-6 shadow-sm hover:shadow-md transition-all group rounded-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="p-2 bg-[#F8FAFC] text-[#0A192F] rounded-sm border border-blue-50">
                <FileText size={20} strokeWidth={1.2} />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-100 rounded-sm">
                Publicat
              </span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F] mb-1">{page}</h3>
            <p className="text-[10px] text-blue-900/30 italic mb-6">Ultima modificare: 10 Martie 2026</p>
            <div className="flex items-center gap-4 pt-4 border-t border-blue-50">
              <button className="text-[9px] uppercase tracking-widest font-bold text-[#0A192F] hover:underline flex items-center gap-2">
                <Edit3 size={12} /> Editare
              </button>
              <button className="text-[9px] uppercase tracking-widest font-bold text-blue-900/30 hover:text-[#0A192F] flex items-center gap-2">
                <ExternalLink size={12} /> Vizualizează
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPages;
