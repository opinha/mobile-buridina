import { useRoute, Link } from "wouter";
import { useApp, type Membro } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Users, Search } from "lucide-react";
import { TribalBorder } from "../components/TribalBorder";
import { useState } from "react";

function MembroCard({ membro }: { membro: Membro }) {
  const fotoSrc = membro.fotoUrl || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  
  return (
    <Link href={`/membro/${membro.id}`}>
      <a className="flex items-center justify-between bg-[#FCFAF6] rounded-xl p-4 shadow-md border border-[#E6DDCC] hover:shadow-lg transition-shadow mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="w-14 h-14 rounded-full border-2 border-[#D4691E]/30 shrink-0 flex-none"
            style={{
              backgroundImage: `url('${fotoSrc}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%'
            }}
          />
          
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[17px] font-bold text-[#4A2B18]">{membro.nomeEtnico}</span>
            <span className="text-[14px] text-[#8B6347] font-medium">
              {membro.nomeSocial}
            </span>
          </div>
        </div>
        <ChevronRight size={20} className="text-[#8B6347]" strokeWidth={2.5}/>
      </a>
    </Link>
  );
}

export default function AldeiaDetail() {
  const [match, params] = useRoute("/aldeia/:id");
  const { getAldeiaById, getMembrosByAldeia } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  
  const aldeia = params?.id ? getAldeiaById(params.id) : undefined;
  const membros = params?.id ? getMembrosByAldeia(params.id) : [];

  const filteredMembros = membros.filter(m => 
    m.nomeEtnico.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nomeSocial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!aldeia) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#F4EFE6]">
        <p className="text-[#4A2B18] font-bold">Aldeia não encontrada.</p>
        <Link href="/">
          <a className="mt-4 text-[#D4691E] font-semibold">Voltar para início</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6]">
      {/* Universal Header */}
      <div className="w-full bg-[#4A2B18] pt-[env(safe-area-inset-top)]">
        <div className="w-full py-5 px-4 flex items-center justify-center relative">
          <Link href="/aldeias">
            <a className="absolute left-4 top-1/2 -translate-y-1/2 text-white active:scale-95 transition-transform">
              <ChevronLeft size={28} strokeWidth={2.5}/>
            </a>
          </Link>
          <h1 className="text-white font-bold text-[20px] tracking-wide">{aldeia.nome}</h1>
        </div>
      </div>
      <TribalBorder />

      {/* Roster / Members List */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        
        <div className="mb-6 border-b border-[#E3D4C0] pb-5">
          <Link href={`/aldeia/${aldeia.id}/cadastrar`}>
            <a className="w-full flex items-center justify-center gap-2 bg-[#E65C00] hover:bg-[#D45500] active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-xl shadow-[0_4px_10px_rgba(230,92,0,0.3)]">
              <span className="text-[18px]">✚</span> Cadastrar Novo Membro
            </a>
          </Link>
        </div>

        <div className="flex flex-col gap-4 mb-6 px-1 pb-4 border-b border-[#E3D4C0]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#4A2B18] uppercase tracking-wide text-[13px]">Membros Registrados</h2>
            <div className="flex items-center gap-1.5 text-[#4A2B18]">
              <Users size={16} />
              <span className="text-[15px] font-bold">{membros.length}</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#8B6347]/60" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome social ou étnico..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCFAF6] border border-[#E6DDCC] rounded-[1rem] py-3 pl-11 pr-4 text-[15px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/50 focus:ring-1 focus:ring-[#D4691E]/50 transition-all placeholder:text-[#8B6347]/60"
            />
          </div>
        </div>

        {filteredMembros.length > 0 ? (
          filteredMembros.map(membro => <MembroCard key={membro.id} membro={membro} />)
        ) : (
          <div className="bg-[#FCFAF6] rounded-2xl p-8 border border-[#E6DDCC] shadow-sm flex flex-col items-center">
            <Search size={40} className="text-[#8B6347] mb-3 opacity-50" />
            <p className="text-[#8B6347] font-medium text-center">Nenhum membro encontrado com este nome.</p>
          </div>
        )}
      </div>
    </div>
  );
}
