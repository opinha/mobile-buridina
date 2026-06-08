import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useApp } from "../context/AppContext";
import { ChevronLeft, Save, Camera, Upload, Trash2, X, RefreshCw } from "lucide-react";
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
  
  const [cameraActive, setCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream if component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Erro ao acessar camera:", err);
      alert("Não foi possível acessar a câmera. Verifique se deu permissão no navegador.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      
      // Use the actual video dimensions if available
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get high quality JPEG data URL (base64)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setFotoUrl(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeSocial.trim()) return;
    
    setIsSubmitting(true);
    
    // Stop camera in case it's still running
    stopCamera();

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

        {/* Premium Image Selector / Camera Section */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-[#4A2B18] font-bold text-[15px] ml-1">Foto do Membro</label>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {!cameraActive && !fotoUrl && (
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 bg-white border border-[#E6DDCC] hover:bg-[#FDFBF7] active:scale-[0.98] transition-all rounded-2xl gap-2 text-[#4A2B18] shadow-sm"
              >
                <Upload size={24} className="text-[#D4691E]" />
                <span className="text-sm font-semibold">Escolher Arquivo</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-5 bg-white border border-[#E6DDCC] hover:bg-[#FDFBF7] active:scale-[0.98] transition-all rounded-2xl gap-2 text-[#4A2B18] shadow-sm"
              >
                <Camera size={24} className="text-[#D4691E]" />
                <span className="text-sm font-semibold">Tirar Foto na Hora</span>
              </button>
            </div>
          )}

          {/* Camera Viewer Stream */}
          {cameraActive && (
            <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-[#D4691E]/60 shadow-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />
              
              {/* Camera Controls Overlay */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-10 px-4">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex items-center justify-center w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full text-white active:scale-90 transition-all"
                  title="Cancelar"
                >
                  <X size={20} />
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex items-center justify-center px-6 py-3 bg-[#E65C00] hover:bg-[#D4691E] rounded-full text-white font-bold shadow-md active:scale-95 transition-all gap-2"
                >
                  <Camera size={20} />
                  <span>Capturar</span>
                </button>
              </div>
            </div>
          )}

          {/* Photo Preview Card */}
          {fotoUrl && !cameraActive && (
            <div className="w-full bg-[#FCFAF6] border border-[#E6DDCC] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl border border-[#4A2B18]/10 shadow-inner bg-cover bg-center"
                  style={{ backgroundImage: `url('${fotoUrl}')` }}
                />
                <div>
                  <p className="text-[#4A2B18] font-bold text-sm">Foto Selecionada</p>
                  <p className="text-[#8B6347] text-xs">Imagem salva em formato perpétuo</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-2.5 bg-white border border-[#E6DDCC] hover:bg-[#FDFBF7] rounded-xl text-[#D4691E] active:scale-95 transition-transform"
                  title="Tirar outra foto"
                >
                  <RefreshCw size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setFotoUrl("")}
                  className="p-2.5 bg-[#FFF0EE] border border-[#FFDAD6] hover:bg-[#FFEAE6] rounded-xl text-[#BA1A1A] active:scale-95 transition-transform"
                  title="Remover foto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
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

