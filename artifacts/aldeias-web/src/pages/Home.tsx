import { Link } from "wouter";
import { ChevronRight, Layers, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useApp, type Aldeia } from "../context/AppContext";

function AldeiaCard({ aldeia, totalMembros, membrosPendentes }: { aldeia: Aldeia, totalMembros: number, membrosPendentes: number }) {
  return (
    <Link href={`/aldeia/${aldeia.id}`}>
      <a className="flex flex-col justify-between bg-white rounded-2xl p-6 shadow-sm border border-[#E6DDCC] hover:shadow-md hover:border-[#D4691E]/40 transition-all text-[#4A2B18] group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B6347] bg-[#E6DDCC]/30 px-3 py-1 rounded-full">
              {aldeia.localizacao || "Sem localidade"}
            </span>
            <ChevronRight className="text-[#8B6347] group-hover:text-[#D4691E] transition-colors" size={20} strokeWidth={2.5}/>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-[#D4691E] transition-colors">{aldeia.nome}</h3>
          <p className="text-sm text-[#8B6347] line-clamp-2 mb-6">{aldeia.descricao || "Sem descrição cadastrada."}</p>
        </div>

        <div className="flex items-center gap-4 border-t border-[#E6DDCC]/50 pt-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#4A2B18]">
            <CheckCircle size={15} className="text-green-600" />
            <span>{totalMembros - membrosPendentes} Ativos</span>
          </div>
          {membrosPendentes > 0 && (
            <div className="flex items-center gap-1.5 text-[#E65C00] bg-[#E65C00]/10 px-2 py-0.5 rounded-md">
              <Clock size={15} />
              <span>{membrosPendentes} Pendentes</span>
            </div>
          )}
        </div>
      </a>
    </Link>
  );
}

export default function Home() {
  const { aldeias, membros, user } = useApp();

  // Calculations
  const pendingMembers = membros.filter((m) => m.status === "pending");
  const totalPendingCount = pendingMembers.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Dashboard Stats Summary */}
      <div className="bg-white rounded-2xl border border-[#E6DDCC] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#4A2B18] mb-4">Resumo do Painel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E6DDCC]/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#3D1F0F]/10 flex items-center justify-center text-[#3D1F0F]">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8B6347] uppercase tracking-wider">Total de Aldeias</p>
              <p className="text-2xl font-black text-[#4A2B18]">{aldeias.length}</p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E6DDCC]/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8B6347] uppercase tracking-wider">Membros Certificados</p>
              <p className="text-2xl font-black text-[#4A2B18]">{membros.filter(m => m.status === "approved").length}</p>
            </div>
          </div>

          <div className={`p-5 rounded-xl border flex items-center gap-4 transition-colors ${totalPendingCount > 0 ? "bg-[#E65C00]/10 border-[#E65C00]/30 text-[#E65C00]" : "bg-[#FAF8F5] border-[#E6DDCC]/50"}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totalPendingCount > 0 ? "bg-[#E65C00] text-white" : "bg-[#8B6347]/10 text-[#8B6347]"}`}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8B6347] uppercase tracking-wider">Pendentes de Votação</p>
              <p className="text-2xl font-black text-[#4A2B18]">{totalPendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Villages Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#3D1F0F]">Aldeias Registradas</h2>
            <p className="text-xs font-semibold text-[#8B6347] mt-0.5">{aldeias.length} aldeias encontradas</p>
          </div>
          {user?.role === "master" && (
            <Link href="/aldeia/cadastrar">
              <a className="bg-[#E65C00] hover:bg-[#D45500] text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-transform active:scale-95 text-center shrink-0">
                ✚ Cadastrar Nova Aldeia
              </a>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aldeias.map((aldeia) => {
            const totalMembros = membros.filter((m) => m.aldeiaId === aldeia.id).length;
            const membrosPendentes = membros.filter((m) => m.aldeiaId === aldeia.id && m.status === "pending").length;
            return (
              <AldeiaCard 
                key={aldeia.id} 
                aldeia={aldeia} 
                totalMembros={totalMembros}
                membrosPendentes={membrosPendentes}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
