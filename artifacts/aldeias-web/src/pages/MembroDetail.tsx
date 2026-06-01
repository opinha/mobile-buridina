import { useRoute, Link } from "wouter";
import { useApp } from "../context/AppContext";
import { ChevronLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function TribalBorder() {
  return (
    <div className="w-full h-2" style={{
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="8" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4L5 0L10 4L15 0L20 4V8L15 4L10 8L5 4L0 8V4Z" fill="%23D4691E" /><path d="M20 4L25 0L30 4L35 0L40 4V8L35 4L30 8L25 4L20 8V4Z" fill="%238B6347" /></svg>')`,
      backgroundRepeat: "repeat-x"
    }} />
  );
}

export default function MembroDetail() {
  const [match, params] = useRoute("/membro/:id");
  const { getMembroById, getAldeiaById } = useApp();
  
  const membro = params?.id ? getMembroById(params.id) : undefined;
  const aldeia = membro ? getAldeiaById(membro.aldeiaId) : undefined;

  if (!membro) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#F4EFE6]">
        <p className="text-[#4A2B18] font-bold">Cartão não encontrado.</p>
        <Link href="/">
          <a className="mt-4 text-[#E65C00] font-semibold">Voltar para início</a>
        </Link>
      </div>
    );
  }

  // Fallback photo showing an indigenous profile since we reset to default mockup
  // If no fotoUrl we provide the same kind of image
  const fotoSrc = membro.fotoUrl || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6] overflow-y-auto px-5 py-8 items-center justify-start">
      
      {/* Identity Card Container */}
      <div className="w-full bg-[#F4EFE6] rounded-[1.5rem] shadow-[0_8px_30px_rgba(74,43,24,0.15)] overflow-hidden border border-[#E6DDCC] flex flex-col flex-none items-center mb-8">
        
        {/* Header Brown */}
        <div className="w-full bg-[#4A2B18] pt-6 pb-4 px-4 flex items-center justify-center relative flex-none">
          <Link href="/aldeias">
            <a className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              <ChevronLeft size={28} strokeWidth={2.5}/>
            </a>
          </Link>
          <h1 className="text-white font-bold text-[19px] tracking-wide">Cartão de Identificação</h1>
        </div>
        <div className="w-full">
           <TribalBorder />
        </div>

        {/* Photo Container */}
        <div className="w-full px-5 pt-6 pb-0 flex flex-col items-center bg-[#F4EFE6]">
          <div 
            className="w-full aspect-[4/3] rounded-t-2xl border-t border-x border-[#4A2B18]/10 shadow-inner flex-none"
            style={{
              backgroundImage: `url('${fotoSrc}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%'
            }}
          />
          {/* Banner Name */}
          <div className="w-full bg-[#4A2B18] py-2.5 flex justify-center items-center shadow-md z-10 flex-none">
            <span className="text-white font-bold text-2xl tracking-wide">{membro.nomeEtnico}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="w-full px-6 pt-5 pb-5 bg-[#F4EFE6]">
          <div className="w-full flex-col flex gap-0">
            <div className="flex flex-row py-3 border-b border-[#E3D4C0]">
              <span className="text-[#4A2B18] text-[15px] font-medium opacity-80 min-w-[100px]">Nome Social:</span>
              <span className="text-[#4A2B18] text-[15px] font-bold ml-1">{membro.nomeSocial}</span>
            </div>
            <div className="flex flex-row py-3 border-b border-[#E3D4C0]">
              <span className="text-[#4A2B18] text-[15px] font-medium opacity-80 min-w-[70px]">Endereço:</span>
              <span className="text-[#4A2B18] text-[15px] font-bold ml-1 flex-1 leading-tight">{membro.endereco || "N/A"}</span>
            </div>
            <div className="flex flex-row py-3 border-b border-[#E3D4C0]">
              <span className="text-[#4A2B18] text-[15px] font-medium opacity-80 min-w-[60px]">Aldeia:</span>
              <span className="text-[#4A2B18] text-[15px] font-bold ml-1">{aldeia ? aldeia.nome : "Desconhecida"}</span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="w-full bg-[#F4EFE6] pb-8 pt-2 flex justify-center items-center">
           <div className="bg-white p-3 shadow-sm rounded-lg border border-[#E3D4C0]">
              <QRCodeSVG value={`membro:${membro.id}`} size={140} fgColor="#2C1810" />
           </div>
        </div>

      </div>
    </div>
  );
}
