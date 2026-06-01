import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";
import { useLocation } from "wouter";
import { Zap, ChevronLeft } from "lucide-react";
import { TribalBorder } from "../components/TribalBorder";
import { Link } from "wouter";

export default function Scanner() {
  const [, setLocation] = useLocation();

  const handleScan = (v: string) => {
    if (v.startsWith("aldeia:")) {
      setLocation(`/aldeia/${v.split(":")[1]}`);
    } else if (v.startsWith("membro:")) {
      setLocation(`/membro/${v.split(":")[1]}`);
    } else {
      alert(`QR Code Lido: ${v}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6] relative">
      {/* Universal Header */}
      <div className="w-full bg-[#4A2B18] pt-[env(safe-area-inset-top)]">
        <div className="w-full py-5 px-4 flex items-center justify-center relative">
          <Link href="/aldeias">
            <a className="absolute left-4 top-1/2 -translate-y-1/2 text-white active:scale-95 transition-transform">
              <ChevronLeft size={28} strokeWidth={2.5}/>
            </a>
          </Link>
          <h1 className="text-white font-bold text-[20px] tracking-wide">Escanear QR</h1>
        </div>
      </div>
      <TribalBorder />

      {/* Body containing Scanner */}
      <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-black pb-16">
        <div className="absolute top-8 w-full z-30 pt-4 flex justify-center items-center pointer-events-none">
           <span className="bg-black/60 px-4 py-2 rounded-full text-white font-semibold tracking-wide drop-shadow-md text-sm border border-white/20">Aponte para o código</span>
        </div>
        
        <QrScanner
          onScan={(result) => {
            if (result && result.length > 0) {
              handleScan(result[0].rawValue);
            }
          }}
          formats={["qr_code"]}
        />

        <div className="absolute bottom-24 w-full flex justify-center z-40">
          <button
            onClick={() => handleScan('membro:membro-1')}
            className="bg-[#D4691E] flex flex-row items-center gap-2 px-6 py-3 rounded-full shadow-xl text-white font-semibold hover:bg-[#C05810] active:scale-[0.98] transition-all"
          >
            <Zap size={20} />
            Simular Leitura
          </button>
        </div>
      </div>
    </div>
  );
}
