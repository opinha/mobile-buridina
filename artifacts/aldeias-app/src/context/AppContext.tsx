import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
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

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface RouteState {
  route: string;
  params?: any;
}

interface AppContextValue {
  aldeias: Aldeia[];
  membros: Membro[];
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  isOnline: boolean;
  serverUrl: string;
  currentRoute: string;
  routeParams: any;
  getMembrosByAldeia: (aldeiaId: string) => Membro[];
  getAldeiaById: (id: string) => Aldeia | undefined;
  getMembroById: (id: string) => Membro | undefined;
  searchMembros: (query: string) => Membro[];
  syncNow: () => Promise<void>;
  addMembro: (membro: Omit<Membro, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateServerUrl: (url: string) => void;
  // Navigation
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  resetNavigation: (route: string, params?: any) => void;
  canGoBack: () => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  aldeias: "@aldeias_app:aldeias_v6",
  membros: "@aldeias_app:membros_v6",
  lastSyncAt: "@aldeias_app:last_sync_at",
  serverUrl: "@aldeias_app:server_url",
  pendingMembros: "@aldeias_app:pending_membros_v6",
};

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SERVER_URL = "http://192.168.1.1:3000"; // ALTERE PARA O SEU IP DO IPCONFIG

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = useRef(false);

  // Navigation State
  const [navHistory, setNavHistory] = useState<RouteState[]>([{ route: "Home" }]);

  const currentRouteState = navHistory[navHistory.length - 1] || { route: "Home" };
  const currentRoute = currentRouteState.route;
  const routeParams = currentRouteState.params;

  const navigate = useCallback((route: string, params?: any) => {
    setNavHistory((prev) => [...prev, { route, params }]);
  }, []);

  const goBack = useCallback(() => {
    setNavHistory((prev) => {
      if (prev.length <= 1) return prev;
      const nextStack = [...prev];
      nextStack.pop();
      return nextStack;
    });
  }, []);

  const resetNavigation = useCallback((route: string, params?: any) => {
    setNavHistory([{ route, params }]);
  }, []);

  const canGoBack = useCallback(() => {
    return navHistory.length > 1;
  }, [navHistory]);

  // Load persisted configuration and data
  useEffect(() => {
    async function init() {
      try {
        const storedUrl = await AsyncStorage.getItem(STORAGE_KEYS.serverUrl);
        const url = storedUrl || DEFAULT_SERVER_URL;
        setServerUrl(url);

        await loadLocal();
      } catch (err) {
        console.error("Failed to initialize app state:", err);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  // Update server URL wrapper
  const updateServerUrl = useCallback((url: string) => {
    try {
      const formatted = url.trim().replace(/\/+$/, "");
      setServerUrl(formatted);
      AsyncStorage.setItem(STORAGE_KEYS.serverUrl, formatted).catch(() => {});
    } catch (err) {
      console.warn("Failed to update server URL:", err);
    }
  }, []);

  // Monitor network state with NetInfo
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = NetInfo.addEventListener((state) => {
        const online = !!(state.isConnected);
        setIsOnline(online);
      });
    } catch (err) {
      console.warn("NetInfo listener failed:", err);
    }

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch {}
      }
    };
  }, []);

  // Schedule periodic sync when online
  useEffect(() => {
    if (!loaded) return;
    if (isOnline) {
      doSync();
      scheduleSync();
    } else {
      setSyncStatus("offline");
      if (syncTimer.current) clearTimeout(syncTimer.current);
    }
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [isOnline, loaded, serverUrl]);

  // Sync when App comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isOnline && loaded) {
        doSync();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isOnline, loaded, serverUrl]);

  function scheduleSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (isOnline) {
        doSync();
        scheduleSync();
      }
    }, SYNC_INTERVAL_MS);
  }

  async function loadLocal() {
    try {
      const aldeiaData = await AsyncStorage.getItem(STORAGE_KEYS.aldeias);
      const membroData = await AsyncStorage.getItem(STORAGE_KEYS.membros);
      const syncData = await AsyncStorage.getItem(STORAGE_KEYS.lastSyncAt);

      const initialAldeias = aldeiaData ? JSON.parse(aldeiaData) : [];
      const initialMembros = membroData ? JSON.parse(membroData) : [];

      setAldeias(initialAldeias);
      setMembros(initialMembros);
      if (syncData) setLastSyncAt(syncData);
    } catch (e) {
      console.warn("Failed to load local cached data:", e);
    }
  }

  // Sinks offline registrations to server
  async function processPendingQueue(currentServerUrl: string) {
    try {
      const pendingData = await AsyncStorage.getItem(STORAGE_KEYS.pendingMembros);
      if (!pendingData) return;

      const queue: any[] = JSON.parse(pendingData);
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} pending members offline registration...`);

      const failedItems: any[] = [];

      for (const item of queue) {
        try {
          const res = await fetch(`${currentServerUrl}/api/membros`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              aldeiaId: item.aldeiaId,
              nomeEtnico: item.nomeEtnico,
              nomeSocial: item.nomeSocial,
              endereco: item.endereco,
              fotoUrl: item.fotoUrl,
            }),
          });
          if (!res.ok) {
            failedItems.push(item);
          }
        } catch (postErr) {
          console.warn("Failed to sync single pending member:", postErr);
          failedItems.push(item);
        }
      }

      // Save only the failed items back to the queue
      await AsyncStorage.setItem(STORAGE_KEYS.pendingMembros, JSON.stringify(failedItems));
    } catch (err) {
      console.warn("Offline sync queue process failed:", err);
    }
  }

  async function doSync() {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setSyncStatus("syncing");

    try {
      // First try to push offline registrations
      if (isOnline) {
        await processPendingQueue(serverUrl);
      }

      // Build URLs using lastSyncAt for Delta Sync if available
      const aldeiasUrl = lastSyncAt
        ? `${serverUrl}/api/aldeias?updatedAfter=${encodeURIComponent(lastSyncAt)}`
        : `${serverUrl}/api/aldeias`;
      
      const membrosUrl = lastSyncAt
        ? `${serverUrl}/api/membros?updatedAfter=${encodeURIComponent(lastSyncAt)}`
        : `${serverUrl}/api/membros`;

      // Then fetch latest database state (full or delta)
      const [aldeiaRes, membroRes] = await Promise.all([
        fetch(aldeiasUrl, { headers: { Accept: "application/json" } }),
        fetch(membrosUrl, { headers: { Accept: "application/json" } }),
      ]);

      if (!aldeiaRes.ok || !membroRes.ok) throw new Error("Fetch failed");

      const deltaAldeias: Aldeia[] = await aldeiaRes.json();
      const deltaMembros: Membro[] = await membroRes.json();

      let finalAldeias = [...aldeias];
      let finalMembros = [...membros];

      if (!lastSyncAt) {
        // First sync: take full datasets
        finalAldeias = deltaAldeias;
        finalMembros = deltaMembros;
      } else {
        // Delta sync: merge updates
        deltaAldeias.forEach((item) => {
          const idx = finalAldeias.findIndex((a) => a.id === item.id);
          if (idx !== -1) {
            finalAldeias[idx] = item;
          } else {
            finalAldeias.push(item);
          }
        });

        // Resolve offline temporary members:
        // Filter out temporary members from current state unless they are still in the pending queue
        const pendingData = await AsyncStorage.getItem(STORAGE_KEYS.pendingMembros);
        const pendingQueue: any[] = pendingData ? JSON.parse(pendingData) : [];

        finalMembros = finalMembros.filter((m) => {
          if (!m.id.startsWith("membro-temp-")) return true;
          // Only keep temp members that failed to sync and remain in the queue
          return pendingQueue.some(
            (pq) =>
              pq.nomeEtnico === m.nomeEtnico &&
              pq.nomeSocial === m.nomeSocial &&
              pq.aldeiaId === m.aldeiaId
          );
        });

        // Merge delta updates
        deltaMembros.forEach((item) => {
          const idx = finalMembros.findIndex((m) => m.id === item.id);
          if (idx !== -1) {
            finalMembros[idx] = item;
          } else {
            finalMembros.push(item);
          }
        });
      }

      setAldeias(finalAldeias);
      setMembros(finalMembros);

      const now = new Date().toISOString();
      setLastSyncAt(now);

      await AsyncStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(finalAldeias));
      await AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(finalMembros));
      await AsyncStorage.setItem(STORAGE_KEYS.lastSyncAt, now);

      setSyncStatus("idle");
    } catch (err) {
      console.warn("Sync failed, operating on cached offline data:", err);
      setSyncStatus(isOnline ? "error" : "offline");
    } finally {
      isSyncing.current = false;
    }
  }

  const syncNow = useCallback(async () => {
    await doSync();
  }, [serverUrl, isOnline]);

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

  const addMembro = useCallback(async (membroData: Omit<Membro, "id" | "createdAt" | "updatedAt">) => {
    const tempId = `membro-temp-${Date.now()}`;
    const novoMembro: Membro = {
      ...membroData,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local state immediately for visual response
    setMembros((prev) => [...prev, novoMembro]);

    if (isOnline) {
      try {
        setSyncStatus("syncing");
        const res = await fetch(`${serverUrl}/api/membros`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(membroData),
        });

        if (!res.ok) throw new Error("Save member failed");

        const savedMembro: Membro = await res.json();

        // Swap out the temporary ID with the server generated UUID
        setMembros((prev) => {
          const nextList = prev.map((m) => (m.id === tempId ? savedMembro : m));
          AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(nextList)).catch(() => {});
          return nextList;
        });

        setSyncStatus("idle");
      } catch (err) {
        console.warn("Failed to POST new member directly to server, falling back to offline queue:", err);
        // Fall back to queueing
        await queueOfflineMembro(membroData, novoMembro);
      }
    } else {
      // Offline queueing
      await queueOfflineMembro(membroData, novoMembro);
    }
  }, [isOnline, serverUrl]);

  async function queueOfflineMembro(
    membroData: Omit<Membro, "id" | "createdAt" | "updatedAt">,
    localMembro: Membro
  ) {
    try {
      const pendingData = await AsyncStorage.getItem(STORAGE_KEYS.pendingMembros);
      const queue = pendingData ? JSON.parse(pendingData) : [];
      queue.push(membroData);
      await AsyncStorage.setItem(STORAGE_KEYS.pendingMembros, JSON.stringify(queue));

      // Save to local cache of members as well so it persists offline
      const storedMembros = await AsyncStorage.getItem(STORAGE_KEYS.membros);
      const list = storedMembros ? JSON.parse(storedMembros) : [];
      list.push(localMembro);
      await AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(list));

      setSyncStatus("offline");
    } catch (e) {
      console.error("Failed to queue member offline:", e);
    }
  }

  return (
    <AppContext.Provider
      value={{
        aldeias,
        membros,
        syncStatus,
        lastSyncAt,
        isOnline,
        serverUrl,
        currentRoute,
        routeParams,
        getMembrosByAldeia,
        getAldeiaById,
        getMembroById,
        searchMembros,
        syncNow,
        addMembro,
        updateServerUrl,
        navigate,
        goBack,
        resetNavigation,
        canGoBack,
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
