import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useApp } from "../context/AppContext";
import { ChevronLeft, Save, MapPin, AlignLeft, Layers, Loader2 } from "lucide-react";

interface EstadoIBGE {
  sigla: string;
  nome: string;
}

interface MunicipioIBGE {
  id: number;
  nome: string;
}

export default function CadastroAldeia() {
  const [, setLocation] = useLocation();
  const { addAldeia, user } = useApp();

  const [nome, setNome] = useState("");
  const [estados, setEstados] = useState<EstadoIBGE[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Route protection - Only master can register villages
  useEffect(() => {
    if (user && user.role !== "master") {
      setLocation("/aldeias");
    }
  }, [user, setLocation]);

  // Fetch Brazilian states from IBGE API
  useEffect(() => {
    async function fetchEstados() {
      setLoadingEstados(true);
      try {
        const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        if (!res.ok) throw new Error("Failed to fetch states");
        const data = await res.json();
        setEstados(data);
      } catch (err) {
        console.error("Error fetching states from IBGE:", err);
      } finally {
        setLoadingEstados(false);
      }
    }
    fetchEstados();
  }, []);

  // Fetch municipalities when state changes
  useEffect(() => {
    if (!selectedEstado) {
      setMunicipios([]);
      setSelectedMunicipio("");
      return;
    }

    async function fetchMunicipios() {
      setLoadingMunicipios(true);
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios?orderBy=nome`);
        if (!res.ok) throw new Error("Failed to fetch municipalities");
        const data = await res.json();
        setMunicipios(data);
        setSelectedMunicipio("");
      } catch (err) {
        console.error("Error fetching municipalities from IBGE:", err);
      } finally {
        setLoadingMunicipios(false);
      }
    }
    fetchMunicipios();
  }, [selectedEstado]);

  if (!user || user.role !== "master") {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-[#FAF8F5]">
        <span className="text-[#8B6347] font-semibold">Carregando permissões...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSubmitting(true);
    try {
      const finalLocalizacao = selectedMunicipio && selectedEstado
        ? `${selectedMunicipio} - ${selectedEstado}`
        : null;

      await addAldeia({
        nome: nome.trim(),
        localizacao: finalLocalizacao,
        descricao: descricao.trim() || null,
      });
      setLocation("/aldeias");
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar aldeia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-[#3D1F0F] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mr-8 -mb-8">
          <Layers size={180} />
        </div>
        <div className="relative z-10">
          <Link href="/aldeias">
            <a className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-2 text-sm font-semibold">
              <ChevronLeft size={16} /> Voltar para Aldeias
            </a>
          </Link>
          <h1 className="text-3xl font-black">Nova Aldeia</h1>
          <p className="text-white/80 mt-1">Registre uma nova aldeia no sistema central de certificação.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E6DDCC] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[#4A2B18] font-bold text-sm ml-1">Nome da Aldeia *</label>
          <input
            required
            autoFocus
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Aldeia Buridiná..."
            className="w-full bg-[#FAF8F5] border border-[#E6DDCC] rounded-xl px-4 py-3 text-sm text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]"
          />
        </div>

        {/* State UF Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#4A2B18] font-bold text-sm ml-1 flex items-center gap-1">
              <MapPin size={16} className="text-[#8B6347]" /> Estado (UF)
            </label>
            <div className="relative">
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                disabled={loadingEstados}
                className="w-full bg-[#FAF8F5] border border-[#E6DDCC] rounded-xl px-4 py-3 text-sm text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E] appearance-none disabled:opacity-50"
              >
                <option value="">Selecione o estado...</option>
                {estados.map((est) => (
                  <option key={est.sigla} value={est.sigla}>
                    {est.nome} ({est.sigla})
                  </option>
                ))}
              </select>
              {loadingEstados && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#8B6347]" />
              )}
            </div>
          </div>

          {/* Municipality Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[#4A2B18] font-bold text-sm ml-1 flex items-center gap-1">
              <MapPin size={16} className="text-[#8B6347]" /> Município
            </label>
            <div className="relative">
              <select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                disabled={!selectedEstado || loadingMunicipios}
                className="w-full bg-[#FAF8F5] border border-[#E6DDCC] rounded-xl px-4 py-3 text-sm text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E] appearance-none disabled:opacity-50"
              >
                <option value="">
                  {!selectedEstado ? "Selecione o estado primeiro..." : "Selecione o município..."}
                </option>
                {municipios.map((mun) => (
                  <option key={mun.id} value={mun.nome}>
                    {mun.nome}
                  </option>
                ))}
              </select>
              {loadingMunicipios && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#8B6347]" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#4A2B18] font-bold text-sm ml-1 flex items-center gap-1">
            <AlignLeft size={16} className="text-[#8B6347]" /> Descrição / Detalhes (Opcional)
          </label>
          <textarea
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Escreva brevemente sobre a aldeia, etnia principal, história..."
            className="w-full bg-[#FAF8F5] border border-[#E6DDCC] rounded-xl px-4 py-3 text-sm text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E] resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E6DDCC]/50 pt-5">
          <Link href="/aldeias">
            <a className="px-5 py-3 rounded-xl border border-[#E6DDCC] hover:bg-[#FAF8F5] text-sm font-semibold text-[#8B6347] transition-all">
              Cancelar
            </a>
          </Link>
          <button
            type="submit"
            disabled={!nome.trim() || isSubmitting}
            className="px-6 py-3 bg-[#E65C00] hover:bg-[#D45500] active:scale-95 transition-all text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:active:scale-100"
          >
            <Save size={18} />
            {isSubmitting ? "Salvando..." : "Salvar Aldeia"}
          </button>
        </div>
      </form>
    </div>
  );
}
