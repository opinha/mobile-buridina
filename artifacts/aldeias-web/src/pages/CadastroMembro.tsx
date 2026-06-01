import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useApp } from "../context/AppContext";
import { ChevronLeft, Save } from "lucide-react";
import { TribalBorder } from "../components/TribalBorder";

export default function CadastroMembro() {
  const [match, params] = useRoute("/aldeia/:id/cadastrar");
  const [, setLocation] = useLocation();
  const { getAldeiaById, addMembro } = useApp();
  
  const aldeiaId = params?.id;
  const aldeia = aldeiaId ? getAldeiaById(aldeiaId) : undefined;

  const [nomeSocial, setNomeSocial] = useState("");
  const [nomeEtnico, setNomeEtnico] = useState("");
  const [endereco, setEndereco] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!aldeia) {
    return (
      <div className="flex flex-col h-full bg-[#F4EFE6] items-center justify-center">
        <p className="text-[#4A2B18] font-bold">Aldeia base não encontrada.</p>
        <Link href="/aldeias">
          <a className="mt-4 text-[#D4691E] font-semibold">Voltar</a>
        </Link>
      </div>
    );
  }

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeSocial.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate minor network delay for feedback
    setTimeout(() => {
      addMembro({
        aldeiaId: aldeia.id,
        nomeSocial: nomeSocial.trim(),
        nomeEtnico: nomeEtnico.trim() || nomeSocial.trim(),
        endereco: endereco.trim() || null,
        fotoUrl: fotoUrl.trim() || null,
      });
      setLocation(`/aldeia/${aldeia.id}`);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6]">
      {/* Universal Header */}
      <div className="w-full bg-[#4A2B18] pt-[env(safe-area-inset-top)] flex-none">
        <div className="w-full py-5 px-4 flex items-center justify-center relative">
          <Link href={`/aldeia/${aldeia.id}`}>
            <a className="absolute left-4 top-1/2 -translate-y-1/2 text-white active:scale-95 transition-transform">
              <ChevronLeft size={28} strokeWidth={2.5}/>
            </a>
          </Link>
          <h1 className="text-white font-bold text-[20px] tracking-wide">Novo Membro</h1>
        </div>
      </div>
      <TribalBorder />

      <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
        <div className="bg-[#FCFAF6] border border-[#E6DDCC] rounded-xl p-5 shadow-sm mb-2">
          <p className="text-[#8B6347] font-medium text-sm mb-1 uppercase tracking-wider">Aldeia Vinculada (Auto)</p>
          <p className="text-[#4A2B18] font-bold text-lg">{aldeia.nome}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#4A2B18] font-bold text-[15px] ml-1">Nome Social *</label>
          <input
            autoFocus
            type="text"
            required
            value={nomeSocial}
            onChange={(e) => setNomeSocial(e.target.value)}
            placeholder="Nome oficial completo..."
            className="w-full bg-white border border-[#E6DDCC] rounded-xl px-4 py-3.5 text-[16px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/60 focus:ring-1 focus:ring-[#D4691E]/60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#4A2B18] font-bold text-[15px] ml-1">Nome Étnico (Opcional)</label>
          <input
            type="text"
            value={nomeEtnico}
            onChange={(e) => setNomeEtnico(e.target.value)}
            placeholder="Nome indígena, se houver..."
            className="w-full bg-white border border-[#E6DDCC] rounded-xl px-4 py-3.5 text-[16px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/60 focus:ring-1 focus:ring-[#D4691E]/60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#4A2B18] font-bold text-[15px] ml-1">Endereço / Local (Opcional)</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Ex: Aldeia Sede, Tenda 3..."
            className="w-full bg-white border border-[#E6DDCC] rounded-xl px-4 py-3.5 text-[16px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/60 focus:ring-1 focus:ring-[#D4691E]/60"
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label className="text-[#4A2B18] font-bold text-[15px] ml-1">Foto (URL / Opcional)</label>
          <input
            type="url"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white border border-[#E6DDCC] rounded-xl px-4 py-3.5 text-[16px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/60 focus:ring-1 focus:ring-[#D4691E]/60"
          />
        </div>

        <div className="mt-auto pt-6 flex-none">
          <button 
            type="submit"
            disabled={!nomeSocial.trim() || isSubmitting}
            className="w-full h-[56px] shadow-md bg-[#3D8B3D] hover:bg-[#2F6B2F] active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-white font-bold text-[17px] outline-none disabled:opacity-50 disabled:active:scale-100"
          >
            <Save size={20} strokeWidth={2.5}/>
            {isSubmitting ? "Salvando..." : "Salvar Membro"}
          </button>
        </div>
      </form>
    </div>
  );
}
