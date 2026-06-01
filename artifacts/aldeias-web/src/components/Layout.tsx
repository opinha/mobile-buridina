import { Link, useLocation } from "wouter";
import { Layers, Maximize, Map, Plus } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-dvh bg-neutral-100 flex items-center justify-center overflow-hidden">
      {/* 
        This wrapper creates a max-w-md constraint to enforce a mobile UI aspect ratio
        on larger screens, while filling 100% of the screen on mobile devices.
      */}
      <div className="w-full max-w-md h-dvh bg-amber-50/50 flex flex-col relative shadow-2xl overflow-hidden sm:border-x border-neutral-200">
        <main className={`flex-1 overflow-y-auto ${location === '/' ? '' : 'pb-20'}`}>
          {children}
        </main>
        
        {/* Bottom Tab Navigation */}
        {location !== '/' && (
          <nav className="absolute bottom-0 w-full bg-[#f8f6f0] border-t border-[#d9c8b0] flex flex-row items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 z-50">
            <Link href="/aldeias">
              <a className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location === '/aldeias' ? 'text-[#D4691E]' : 'text-[#8B6347]'}`}>
                <Layers size={24} />
              <span className="text-xs font-semibold">Aldeias</span>
            </a>
          </Link>
          
          <Link href="/scanner">
            <a className="flex flex-col items-center gap-1 p-3 -mt-6 bg-[#3D1F0F] rounded-2xl shadow-lg text-white">
              <Maximize size={24} />
            </a>
          </Link>
        </nav>
        )}
      </div>
    </div>
  );
}
