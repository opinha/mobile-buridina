import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";
import { KeyRound, User, AlertCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(username.trim().toLowerCase(), password);
      setLocation("/aldeias");
    } catch (err: any) {
      console.error("Login component error:", err);
      // Se err for um objeto complexo, tenta pegar uma mensagem string
      const msg = typeof err === 'string'
        ? err
        : (err.message || JSON.stringify(err));
      setError(msg.includes("[object Object]") ? "Erro de conexão com o servidor." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col min-h-dvh items-center justify-between pb-16 pt-24 px-6 bg-cover bg-center relative font-sans"
      style={{ backgroundImage: "url('/bg-login.jpg')", backgroundColor: "#4A2B18" }}
    >
      {/* Dark overlay to ensure text is readable against the background photo */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Top Section */}
      <div className="flex flex-col items-center justify-center z-10 w-full mt-4">
        <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
          Aldeias Digitais
        </h1>
        <p className="text-white/80 text-sm font-semibold mt-2 uppercase tracking-widest drop-shadow-md">
          Painel de Certificação
        </p>
      </div>

      {/* Login Card Form */}
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-[340px] bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-4 animate-fade-in text-white"
      >
        <h3 className="text-xl font-bold text-center border-b border-white/15 pb-3">Entrar no Painel</h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-xs flex items-start gap-2 text-red-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1">Usuário</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário..."
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-[15px] outline-none focus:border-[#E65C00]/80 focus:ring-1 focus:ring-[#E65C00]/80 transition-all placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1">Senha</label>
          <div className="relative">
            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha..."
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-[15px] outline-none focus:border-[#E65C00]/80 focus:ring-1 focus:ring-[#E65C00]/80 transition-all placeholder:text-white/35"
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full mt-2 h-[50px] bg-[#E65C00] shadow-[0_4px_15px_rgba(230,92,0,0.4)] hover:bg-[#D45500] active:scale-95 transition-all outline-none rounded-xl text-white font-bold tracking-wide flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? "Autenticando..." : "Entrar"}
        </button>
      </form>

      {/* Footer Instructions Info */}
      <div className="z-10 text-center text-white/40 text-[10px] max-w-[280px]">
        Desenvolvido para auditoria e controle de cadastros. Contate o administrador master para novas credenciais.
      </div>
    </div>
  );
}
