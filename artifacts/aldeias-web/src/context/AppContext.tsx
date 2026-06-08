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

export interface Voto {
  id: string;
  membroId: string;
  avaliadorNome: string;
  voto: "aprovar" | "rejeitar";
  createdAt: string;
}

export interface Membro {
  id: string;
  aldeiaId: string;
  nomeEtnico: string;
  nomeSocial: string;
  endereco?: string | null;
  fotoUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  votos?: Voto[];
  createdAt: string;
  updatedAt: string;
}

export interface LoggedUser {
  id: string;
  username: string;
  role: "master" | "admin" | "avaliador";
  nome: string;
}

type SyncStatus = "idle" | "syncing" | "error" | "offline";

interface AppContextValue {
  aldeias: Aldeia[];
  membros: Membro[];
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  isOnline: boolean;
  user: LoggedUser | null;
  getMembrosByAldeia: (aldeiaId: string) => Membro[];
  getAldeiaById: (id: string) => Aldeia | undefined;
  getMembroById: (id: string) => Membro | undefined;
  searchMembros: (query: string) => Membro[];
  syncNow: () => Promise<void>;
  addMembro: (membro: Omit<Membro, "id" | "createdAt" | "updatedAt" | "status" | "votos">) => Promise<void>;
  addAldeia: (aldeia: Omit<Aldeia, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  voteOnMembro: (membroId: string, avaliadorNome: string, voto: "aprovar" | "rejeitar") => Promise<void>;
  decideMembroStatus: (membroId: string, status: "pending" | "approved" | "rejected") => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  aldeias: "@aldeias_app:aldeias_v6",
  membros: "@aldeias_app:membros_v6",
  lastSyncAt: "@aldeias_app:last_sync_at",
  user: "@aldeias_web:user_v6",
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
  const [user, setUser] = useState<LoggedUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.user);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
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
    if (isOnline && user) {
      syncNow();
      scheduleSync();
    }
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [isOnline, loaded, user]);

  // Sync when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOnline && user) {
        syncNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOnline, user]);

  function scheduleSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (user) {
        syncNow();
        scheduleSync();
      }
    }, SYNC_INTERVAL_MS);
  }

  async function loadLocal() {
    try {
      const aldeiaData = localStorage.getItem(STORAGE_KEYS.aldeias);
      const membroData = localStorage.getItem(STORAGE_KEYS.membros);
      const syncData = localStorage.getItem(STORAGE_KEYS.lastSyncAt);

      const initialAldeias = aldeiaData ? JSON.parse(aldeiaData) : [];
      const initialMembros = membroData ? JSON.parse(membroData) : [];

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
        apiFetch("/api/membros?status=all"), // Web needs all members including pending/rejected
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

  const getMembrosByAldeia = useCallback((aldeiaId: string) => {
    return membros.filter((m) => m.aldeiaId === aldeiaId);
  }, [membros]);

  const getAldeiaById = useCallback((id: string) => {
    return aldeias.find((a) => a.id === id);
  }, [aldeias]);

  const getMembroById = useCallback((id: string) => {
    return membros.find((m) => m.id === id);
  }, [membros]);

  const searchMembros = useCallback((query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return membros.filter(
      (m) =>
        m.nomeEtnico.toLowerCase().includes(q) ||
        m.nomeSocial.toLowerCase().includes(q)
    );
  }, [membros]);

  const addMembro = useCallback(async (membroData: Omit<Membro, "id" | "createdAt" | "updatedAt" | "status" | "votos">) => {
    try {
      const res = await fetch(`${getApiBase()}/api/membros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(user ? {
            "X-User-Role": user.role,
            "X-User-Username": user.username
          } : {})
        },
        body: JSON.stringify(membroData),
      });

      if (!res.ok) throw new Error("Save member failed");

      const savedMembro: Membro = await res.json();

      setMembros((prev) => {
        const nextList = [...prev, savedMembro];
        localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(nextList));
        return nextList;
      });
    } catch (err) {
      console.warn("Failed to save member via API, writing mock local:", err);
      const tempId = `membro-temp-${Date.now()}`;
      const mockMembro: Membro = {
        ...membroData,
        id: tempId,
        status: "pending",
        votos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMembros((prev) => {
        const nextList = [...prev, mockMembro];
        localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(nextList));
        return nextList;
      });
    }
  }, [membros]);

  const voteOnMembro = useCallback(async (membroId: string, avaliadorNome: string, voto: "aprovar" | "rejeitar") => {
    try {
      const res = await fetch(`${getApiBase()}/api/membros/${membroId}/voto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ avaliadorNome, voto }),
      });

      if (!res.ok) throw new Error("Vote failed");

      const updatedMembro: Membro = await res.json();

      setMembros((prev) => {
        const nextList = prev.map((m) => (m.id === membroId ? updatedMembro : m));
        localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(nextList));
        return nextList;
      });
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }
  }, [membros]);

  const decideMembroStatus = useCallback(async (membroId: string, status: "pending" | "approved" | "rejected") => {
    try {
      const res = await fetch(`${getApiBase()}/api/membros/${membroId}/decidir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Decide failed");

      const updatedMembro: Membro = await res.json();

      setMembros((prev) => {
        const nextList = prev.map((m) => (m.id === membroId ? updatedMembro : m));
        localStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(nextList));
        return nextList;
      });
    } catch (err) {
      console.error("Failed to update status manually:", err);
    }
  }, [membros]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let errorMessage = "Falha na autenticação.";
        try {
          const errData = await res.json();
          errorMessage = errData.error || errorMessage;
        } catch {
          // If response is not JSON (e.g. HTML 404/500 from proxy), read as text or use status
          errorMessage = `Erro no servidor: código ${res.status}. Certifique-se de que o backend está rodando.`;
        }
        throw new Error(errorMessage);
      }

      const userData: LoggedUser = await res.json();
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
    } catch (err: any) {
      console.error("AppContext login error:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.toLowerCase().includes("fetch") || errMsg.toLowerCase().includes("network")) {
        throw new Error("Não foi possível conectar ao servidor. O backend está rodando?");
      }
      throw err;
    }
  }, []);

  const addAldeia = useCallback(async (aldeiaData: Omit<Aldeia, "id" | "createdAt" | "updatedAt">) => {
    try {
      const res = await fetch(`${getApiBase()}/api/aldeias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(aldeiaData),
      });

      if (!res.ok) throw new Error("Save village failed");

      const savedAldeia: Aldeia = await res.json();

      setAldeias((prev) => {
        const nextList = [...prev, savedAldeia];
        localStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(nextList));
        return nextList;
      });
    } catch (err) {
      console.warn("Failed to save village via API, writing mock local:", err);
      const tempId = `aldeia-temp-${Date.now()}`;
      const mockAldeia: Aldeia = {
        ...aldeiaData,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAldeias((prev) => {
        const nextList = [...prev, mockAldeia];
        localStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(nextList));
        return nextList;
      });
    }
  }, [aldeias]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  return (
    <AppContext.Provider
      value={{
        aldeias,
        membros,
        syncStatus,
        lastSyncAt,
        isOnline,
        user,
        getMembrosByAldeia,
        getAldeiaById,
        getMembroById,
        searchMembros,
        syncNow,
        addMembro,
        addAldeia,
        voteOnMembro,
        decideMembroStatus,
        login,
        logout,
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
