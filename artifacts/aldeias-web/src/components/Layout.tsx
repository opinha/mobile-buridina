import { Link, useLocation } from "wouter";
import { Layers, LogOut, User } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useApp();

  const isLoginPage = location === "/";

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user && !isLoginPage) {
      setLocation("/");
    }
  }, [user, isLoginPage, setLocation]);

  if (isLoginPage) {
    return (
      <div className="min-h-dvh w-full flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Get user role display styles
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "master":
        return "bg-purple-600 text-white";
      case "admin":
        return "bg-[#E65C00] text-white";
      case "avaliador":
        return "bg-blue-600 text-white";
      default:
        return "bg-stone-500 text-white";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "master":
        return "Master";
      case "admin":
        return "Admin";
      case "avaliador":
        return "Avaliador";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-[#3D1F0F] flex flex-col font-sans">
      {/* Responsive Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#3D1F0F] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E65C00] flex items-center justify-center font-bold text-white text-lg">
              A
            </div>
            <Link href="/aldeias">
              <a className="font-black text-xl tracking-tight text-white hover:text-[#FF8C39] transition-colors">
                Aldeias Digitais <span className="text-xs font-normal text-white/70 bg-white/10 px-2 py-0.5 rounded-full ml-1">Painel Administrativo</span>
              </a>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link href="/aldeias">
                <a className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${location === "/aldeias" || location.startsWith("/aldeia/") ? "bg-white/10 text-white" : "text-white/80 hover:text-white"}`}>
                  <Layers size={18} />
                  <span>Aldeias</span>
                </a>
              </Link>
            </nav>

            {user && (
              <div className="flex items-center gap-4 border-l border-white/20 pl-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-bold leading-tight">{user.nome}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded self-end mt-0.5 ${getRoleBadge(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setLocation("/");
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-red-600/30 text-white/80 hover:text-red-400 transition-colors"
                  title="Sair do sistema"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1F1008] text-white/50 py-6 border-t border-[#3D1F0F]/20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Aldeias Digitais. Todos os direitos reservados. Sistema de Certificação e Votação.</p>
        </div>
      </footer>
    </div>
  );
}

