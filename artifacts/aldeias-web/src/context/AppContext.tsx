import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Aldeia {
  id: string;
  nome: string;
  descricao?: string | null;
  localizacao?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membro {
  id: string;
  aldeiaId: string;
  nomeEtnico: string;
  nomeSocial: string;
  endereco?: string | null;
  fotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

type SyncStatus = "idle" | "syncing" | "error" | "offline";

interface AppContextValue {
  aldeias: Aldeia[];
  membros: Membro[];
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  isOnline: boolean;
  getMembrosByAldeia: (aldeiaId: string) => Membro[];
  getAldeiaById: (id: string) => Aldeia | undefined;
  getMembroById: (id: string) => Membro | undefined;
  searchMembros: (query: string) => Membro[];
  syncNow: () => Promise<void>;
  addMembro: (membro: Omit<Membro, "id" | "createdAt" | "updatedAt">) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  aldeias: "@aldeias_app:aldeias_v6",
  membros: "@aldeias_app:membros_v6",
  lastSyncAt: "@aldeias_app:last_sync_at",
};

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getApiBase(): string {
  // Use relative path for proxy, or environment variable if provided
  return "";
}

async function apiFetch(path: string): Promise<Response> {
  return fetch(`${getApiBase()}${path}`, {
    headers: { Accept: "application/json" },
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted data
  useEffect(() => {
    loadLocal();
  }, []);

  // Monitor network state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Schedule periodic sync when online
  useEffect(() => {
    if (!loaded) return;
    if (isOnline) {
      syncNow();
      scheduleSync();
    }
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [isOnline, loaded]);

  // Sync when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOnline) {
        syncNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOnline]);

  function scheduleSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncNow();
      scheduleSync();
    }, SYNC_INTERVAL_MS);
  }

  async function loadLocal() {
    try {
      const aldeiaData = localStorage.getItem(STORAGE_KEYS.aldeias);
      const membroData = localStorage.getItem(STORAGE_KEYS.membros);
      const syncData = localStorage.getItem(STORAGE_KEYS.lastSyncAt);

      let initialAldeias = aldeiaData ? JSON.parse(aldeiaData) : [];
      let initialMembros = membroData ? JSON.parse(membroData) : [];

      if (initialAldeias.length === 0) {
        initialAldeias = [
          {
            id: "aldeia-1",
            nome: "Aldeia Buridiná",
            localizacao: "Aruanã",
            descricao: "Uma aldeia ancestral Karajá.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "aldeia-2",
            nome: "Aldeia Inhumas",
            localizacao: "Goiás",
            descricao: "Instituto Federal de Goiás.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        initialMembros = [
          {
            id: "membro-1",
            aldeiaId: "aldeia-1",
            nomeEtnico: "Ixã",
            nomeSocial: "Dante de Souza",
            endereco: "Rua das Palmeiras, 123",
            fotoUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "membro-2",
            aldeiaId: "aldeia-2",
            nomeEtnico: "Iberê",
            nomeSocial: "Yendo Leonardo",
            endereco: "Aldeia IFG",
            fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        localStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(initialAldeias));
        localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(initialMembros));
        setAldeias(initialAldeias);
        setMembros(initialMembros);
      }

      setAldeias(initialAldeias);
      setMembros(initialMembros);
      if (syncData) setLastSyncAt(syncData);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }

  const syncNow = useCallback(async () => {
    if (syncStatus === "syncing") return;
    setSyncStatus("syncing");
    try {
      const [aldeiaRes, membroRes] = await Promise.all([
        apiFetch("/api/aldeias"),
        apiFetch("/api/membros"),
      ]);

      if (!aldeiaRes.ok || !membroRes.ok) throw new Error("fetch failed");

      const [aldeiaData, membroData] = await Promise.all([
        aldeiaRes.json() as Promise<Aldeia[]>,
        membroRes.json() as Promise<Membro[]>,
      ]);

      setAldeias(aldeiaData);
      setMembros(membroData);

      const now = new Date().toISOString();
      setLastSyncAt(now);

      localStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(aldeiaData));
      localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(membroData));
      localStorage.setItem(STORAGE_KEYS.lastSyncAt, now);

      setSyncStatus("idle");
    } catch {
      setSyncStatus(isOnline ? "error" : "offline");
    }
  }, [syncStatus, isOnline]);

  function getMembrosByAldeia(aldeiaId: string) {
    return membros.filter((m) => m.aldeiaId === aldeiaId);
  }

  function getAldeiaById(id: string) {
    return aldeias.find((a) => a.id === id);
  }

  function getMembroById(id: string) {
    return membros.find((m) => m.id === id);
  }

  function searchMembros(query: string): Membro[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return membros.filter(
      (m) =>
        m.nomeEtnico.toLowerCase().includes(q) ||
        m.nomeSocial.toLowerCase().includes(q)
    );
  }

  function addMembro(membroData: Omit<Membro, "id" | "createdAt" | "updatedAt">) {
    const novoMembro: Membro = {
      ...membroData,
      id: `membro-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const novaLista = [...membros, novoMembro];
    setMembros(novaLista);
    localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(novaLista));
  }

  return (
    <AppContext.Provider
      value={{
        aldeias,
        membros,
        syncStatus,
        lastSyncAt,
        isOnline,
        getMembrosByAldeia,
        getAldeiaById,
        getMembroById,
        searchMembros,
        syncNow,
        addMembro,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
