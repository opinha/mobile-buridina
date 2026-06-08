import { useRoute, Link } from "wouter";
import { useApp, type Membro } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Users, Search, ThumbsUp, ThumbsDown, CheckCircle, XCircle, ShieldAlert, Award } from "lucide-react";
import { useState } from "react";

function MembroCard({ membro }: { membro: Membro }) {
  const fotoSrc = membro.fotoUrl || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  
  return (
    <Link href={`/membro/${membro.id}`}>
      <a className="flex items-center justify-between bg-[#FCFAF6] rounded-xl p-4 shadow-sm border border-[#E6DDCC] hover:shadow-md hover:border-[#D4691E]/30 transition-all">
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
  const { getAldeiaById, getMembrosByAldeia, voteOnMembro, decideMembroStatus, user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");

  const aldeia = params?.id ? getAldeiaById(params.id) : undefined;
  const todosMembros = params?.id ? getMembrosByAldeia(params.id) : [];

  if (!aldeia) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#F4EFE6] py-12">
        <p className="text-[#4A2B18] font-bold">Aldeia não encontrada.</p>
        <Link href="/aldeias">
          <a className="mt-4 text-[#D4691E] font-semibold">Voltar para início</a>
        </Link>
      </div>
    );
  }

  // Filter members by tab
  const approvedMembers = todosMembros.filter(m => m.status === "approved");
  const pendingOrRejectedMembers = todosMembros.filter(m => m.status === "pending" || m.status === "rejected");

  const currentList = activeTab === "approved" ? approvedMembers : pendingOrRejectedMembers;

  const filteredMembros = currentList.filter(m => 
    m.nomeEtnico.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nomeSocial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVote = (membroId: string, voto: "aprovar" | "rejeitar") => {
    if (!user) {
      alert("Você precisa estar logado para votar.");
      return;
    }
    voteOnMembro(membroId, user.nome, voto);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "master":
        return "Master";
      case "admin":
        return "Administrador";
      case "avaliador":
        return "Avaliador";
      default:
        return role || "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-[#3D1F0F] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mr-8 -mb-8">
          <Users size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/aldeias">
              <a className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-2 text-sm font-semibold">
                <ChevronLeft size={16} /> Voltar para Aldeias
              </a>
            </Link>
            <h1 className="text-3xl font-black">{aldeia.nome}</h1>
            <p className="text-white/80 mt-1 max-w-2xl">{aldeia.descricao || "Esta aldeia não possui descrição detalhada."}</p>
          </div>
          {(user?.role === "admin" || user?.role === "master") && (
            <Link href={`/aldeia/${aldeia.id}/cadastrar`}>
              <a className="bg-[#E65C00] hover:bg-[#D45500] text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-center shrink-0">
                ✚ Cadastrar Novo Membro
              </a>
            </Link>
          )}
        </div>
      </div>

      {/* Evaluator Identity Info Box */}
      {activeTab === "pending" && user && (
        <div className="bg-white rounded-xl border border-[#E6DDCC] p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="block text-xs font-bold text-[#8B6347] uppercase tracking-wider">Avaliador Ativo</span>
            <p className="text-sm font-bold text-[#4A2B18]">
              {user.nome} <span className="text-xs font-normal text-[#8B6347] bg-[#FAF8F5] px-2 py-0.5 border border-[#E6DDCC] rounded-full ml-1">{getRoleLabel(user.role)}</span>
            </p>
          </div>
          <div className="text-xs text-[#8B6347] max-w-xs text-right hidden sm:block">
            💡 Seus votos são registrados sob o seu nome. 2 votos favoráveis aprovam o membro.
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-[#E6DDCC] gap-4">
        <button 
          onClick={() => setActiveTab("approved")}
          className={`pb-3 text-lg font-bold transition-all relative outline-none ${activeTab === "approved" ? "text-[#E65C00]" : "text-[#8B6347]/60 hover:text-[#8B6347]"}`}
        >
          Membros Certificados ({approvedMembers.length})
          {activeTab === "approved" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E65C00] rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("pending")}
          className={`pb-3 text-lg font-bold transition-all relative outline-none flex items-center gap-1.5 ${activeTab === "pending" ? "text-[#E65C00]" : "text-[#8B6347]/60 hover:text-[#8B6347]"}`}
        >
          Fila de Avaliação ({pendingOrRejectedMembers.length})
          {pendingOrRejectedMembers.filter(m => m.status === "pending").length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#E65C00] animate-pulse" />
          )}
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E65C00] rounded-full" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-[#8B6347]/60" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar nesta lista por nome social ou étnico..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#E6DDCC] rounded-xl py-3 pl-11 pr-4 text-[15px] text-[#4A2B18] shadow-sm outline-none focus:border-[#D4691E]/50 focus:ring-1 focus:ring-[#D4691E]/50 transition-all placeholder:text-[#8B6347]/60"
        />
      </div>

      {/* Members Lists */}
      {activeTab === "approved" ? (
        // Regular Grid for Approved Members
        filteredMembros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembros.map(membro => <MembroCard key={membro.id} membro={membro} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-[#E6DDCC] shadow-sm flex flex-col items-center justify-center">
            <Search size={48} className="text-[#8B6347] mb-3 opacity-40" />
            <h3 className="font-bold text-[#4A2B18]">Nenhum membro certificado encontrado</h3>
            <p className="text-sm text-[#8B6347]">Certifique-se de digitar o nome corretamente.</p>
          </div>
        )
      ) : (
        // Voting Cards for Pending / Rejected Members
        filteredMembros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMembros.map(membro => {
              const fotoSrc = membro.fotoUrl || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              const votosMembro = membro.votos || [];
              const aprovarCount = votosMembro.filter(v => v.voto === "aprovar").length;
              const rejeitarCount = votosMembro.filter(v => v.voto === "rejeitar").length;

              return (
                <div key={membro.id} className="bg-white rounded-2xl border border-[#E6DDCC] p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl border border-[#E6DDCC] shrink-0"
                      style={{
                        backgroundImage: `url('${fotoSrc}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 20%'
                      }}
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-[#4A2B18]">{membro.nomeEtnico}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${membro.status === "rejected" ? "bg-red-100 text-red-700" : "bg-[#E65C00]/10 text-[#E65C00]"}`}>
                          {membro.status === "rejected" ? "Rejeitado" : "Pendente"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#8B6347]">{membro.nomeSocial}</p>
                      <p className="text-xs text-[#8B6347]/80">{membro.endereco || "Sem endereço"}</p>
                    </div>
                  </div>

                  {/* Vote Summary */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E6DDCC]/50 text-xs">
                    <div className="flex items-center justify-between font-bold mb-2">
                      <span>Votos Atuais</span>
                      <span className="text-stone-500">{votosMembro.length} votos</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-green-700">
                        <ThumbsUp size={14} /> {aprovarCount} Aprovam
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-red-600">
                        <ThumbsDown size={14} /> {rejeitarCount} Rejeitam
                      </div>
                    </div>

                    {votosMembro.length > 0 ? (
                      <div className="text-[10px] text-[#8B6347] mt-1 space-y-0.5 border-t border-[#E6DDCC]/50 pt-2">
                        {votosMembro.map((v) => (
                          <div key={v.id} className="flex justify-between">
                            <span className="font-medium">{v.avaliadorNome}:</span>
                            <span className={v.voto === "aprovar" ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                              {v.voto === "aprovar" ? "Aprovou" : "Rejeitou"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-[#8B6347]/70 py-1 italic">Nenhum voto registrado ainda.</div>
                    )}
                  </div>

                  {/* Vote Actions */}
                  <div className="flex gap-2 border-t border-[#E6DDCC]/30 pt-3">
                    <button 
                      onClick={() => handleVote(membro.id, "aprovar")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 font-bold py-2 rounded-lg text-sm active:scale-95 transition-all outline-none"
                    >
                      <ThumbsUp size={16} /> Aprovar
                    </button>
                    <button 
                      onClick={() => handleVote(membro.id, "rejeitar")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold py-2 rounded-lg text-sm active:scale-95 transition-all outline-none"
                    >
                      <ThumbsDown size={16} /> Rejeitar
                    </button>
                  </div>

                  {/* Override actions for master or admin */}
                  {(user?.role === "admin" || user?.role === "master") && (
                    <div className="flex gap-1 justify-end mt-1 border-t border-[#E6DDCC]/20 pt-2">
                      <button 
                        onClick={() => decideMembroStatus(membro.id, "approved")}
                        className="text-[10px] text-green-700 hover:underline px-2 py-0.5 bg-green-50 rounded font-bold"
                      >
                        Aprovar Direto
                      </button>
                      <button 
                        onClick={() => decideMembroStatus(membro.id, "rejected")}
                        className="text-[10px] text-red-700 hover:underline px-2 py-0.5 bg-red-50 rounded font-bold"
                      >
                        Rejeitar Direto
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-[#E6DDCC] shadow-sm flex flex-col items-center justify-center">
            <Award size={48} className="text-[#8B6347] mb-3 opacity-40 animate-bounce" />
            <h3 className="font-bold text-[#4A2B18]">Fila limpa!</h3>
            <p className="text-sm text-[#8B6347]">Nenhum membro aguardando votação.</p>
          </div>
        )
      )}
    </div>
  );
}

