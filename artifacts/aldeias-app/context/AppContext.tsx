import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

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
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  aldeias: "@aldeias_app:aldeias_v2",
  membros: "@aldeias_app:membros_v2",
  lastSyncAt: "@aldeias_app:last_sync_at",
};

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getApiBase(): string {
  return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
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
  const [isOnline, setIsOnline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted data
  useEffect(() => {
    loadLocal();
  }, []);

  // Monitor network state
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });
    return () => unsub();
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
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active" && isOnline) {
        syncNow();
      }
    });
    return () => sub.remove();
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
      const [aldeiaData, membroData, syncData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.aldeias),
        AsyncStorage.getItem(STORAGE_KEYS.membros),
        AsyncStorage.getItem(STORAGE_KEYS.lastSyncAt),
      ]);

      if (aldeiaData) setAldeias(JSON.parse(aldeiaData));
      if (membroData) setMembros(JSON.parse(membroData));
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

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(aldeiaData)),
        AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(membroData)),
        AsyncStorage.setItem(STORAGE_KEYS.lastSyncAt, now),
      ]);

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
