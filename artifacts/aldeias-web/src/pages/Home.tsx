import { Link } from "wouter";
import { ChevronRight, Layers, Bell } from "lucide-react";
import { useApp, type Aldeia } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

function AldeiaCard({ aldeia }: { aldeia: Aldeia }) {
  return (
    <Link href={`/aldeia/${aldeia.id}`}>
      <a className="flex items-center justify-between bg-[#FCFAF6] rounded-xl px-5 py-4 shadow-md border border-[#E6DDCC] hover:shadow-lg transition-all mb-4 text-[#4A2B18]">
        <span className="text-[17px] font-bold">{aldeia.nome}</span>
        <ChevronRight size={20} strokeWidth={2.5}/>
      </a>
    </Link>
  );
}

export default function Home() {
  const { aldeias } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6] relative">
      {/* Universal Header */}
      <div className="w-full bg-[#4A2B18] pt-[env(safe-area-inset-top)]">
        <div className="w-full py-5 px-4 flex items-center justify-center relative">
          <h1 className="text-white font-bold text-[20px] tracking-wide">Aldeias Cadastradas</h1>
          <button className="absolute right-5 top-1/2 -translate-y-1/2 text-white active:scale-95 transition-transform">
            <Bell size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <TribalBorder />

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-20">
        {aldeias.map((aldeia) => (
          <AldeiaCard key={aldeia.id} aldeia={aldeia} />
        ))}
      </div>
    </div>
  );
}
