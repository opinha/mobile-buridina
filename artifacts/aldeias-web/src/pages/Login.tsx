import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  return (
    <div 
      className="flex flex-col h-full items-center justify-between pb-16 pt-32 px-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg-login.jpg')", backgroundColor: "#4A2B18" }}
    >
      {/* Dark overlay to ensure text is readable against the detailed photo */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Top Section */}
      <div className="flex flex-col items-center justify-center z-10 w-full mt-10">
        <h1 className="text-white text-5xl font-black tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
          Bem-vindo
        </h1>
        <p className="text-white/90 text-lg font-medium mt-2 drop-shadow-md">
          Aldeias Digitais
        </p>
      </div>

      {/* Bottom Section */}
      <div className="w-full z-10 flex flex-col items-center pb-8">
        <button 
          onClick={() => setLocation("/aldeias")}
          className="w-[90%] max-w-[300px] h-[60px] bg-[#E65C00] shadow-[0_4px_20px_rgba(230,92,0,0.5)] flex items-center justify-center rounded-2xl text-white font-bold text-[20px] tracking-wide hover:bg-[#D45500] active:scale-95 transition-all outline-none"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
