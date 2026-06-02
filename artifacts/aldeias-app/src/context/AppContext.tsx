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
import { setBaseUrl } from "@workspace/api-client-react";

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

  // Navigation State
  const [navHistory, setNavHistory] = useState<RouteState[]>([{ route: "Login" }]);

  const currentRouteState = navHistory[navHistory.length - 1] || { route: "Login" };
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
        setBaseUrl(url);

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
    const formatted = url.trim().replace(/\/+$/, "");
    setServerUrl(formatted);
    setBaseUrl(formatted);
    AsyncStorage.setItem(STORAGE_KEYS.serverUrl, formatted);
  }, []);

  // Monitor network state with NetInfo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable !== false;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  // Schedule periodic sync when online
  useEffect(() => {
    if (!loaded) return;
    if (isOnline) {
      syncNow();
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
        syncNow();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isOnline, loaded, serverUrl]);

  function scheduleSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (isOnline) {
        syncNow();
        scheduleSync();
      }
    }, SYNC_INTERVAL_MS);
  }

  async function loadLocal() {
    try {
      const aldeiaData = await AsyncStorage.getItem(STORAGE_KEYS.aldeias);
      const membroData = await AsyncStorage.getItem(STORAGE_KEYS.membros);
      const syncData = await AsyncStorage.getItem(STORAGE_KEYS.lastSyncAt);

      let initialAldeias = aldeiaData ? JSON.parse(aldeiaData) : [];
      let initialMembros = membroData ? JSON.parse(membroData) : [];

      if (initialAldeias.length === 0) {
        // Fallback mockup data if AsyncStorage is empty
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
        await AsyncStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(initialAldeias));
        await AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(initialMembros));
      }

      setAldeias(initialAldeias);
      setMembros(initialMembros);
      if (syncData) setLastSyncAt(syncData);
    } catch (e) {
      console.warn("Failed to load local cached data:", e);
    }
  }

  // Sinks offline registrations to server
  const processPendingQueue = useCallback(async (currentServerUrl: string) => {
    try {
      const pendingData = await AsyncStorage.getItem(STORAGE_KEYS.pendingMembros);
      if (!pendingData) return;

      const queue: any[] = JSON.parse(pendingData);
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} pending members offline registration...`);

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
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        } catch (postErr) {
          console.warn("Failed to sync single pending member, keeping in queue:", postErr);
          throw postErr; // Stop processing queue if server is failing
        }
      }

      // Clear pending queue on successful upload
      await AsyncStorage.setItem(STORAGE_KEYS.pendingMembros, JSON.stringify([]));
    } catch (err) {
      console.warn("Offline sync queue process failed:", err);
      throw err;
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncStatus === "syncing") return;
    setSyncStatus("syncing");

    try {
      // First try to push offline registrations
      if (isOnline) {
        await processPendingQueue(serverUrl);
      }

      // Then fetch latest database state
      const [aldeiaRes, membroRes] = await Promise.all([
        fetch(`${serverUrl}/api/aldeias`, { headers: { Accept: "application/json" } }),
        fetch(`${serverUrl}/api/membros`, { headers: { Accept: "application/json" } }),
      ]);

      if (!aldeiaRes.ok || !membroRes.ok) throw new Error("Fetch failed");

      const aldeiaData: Aldeia[] = await aldeiaRes.json();
      const membroData: Membro[] = await membroRes.json();

      setAldeias(aldeiaData);
      setMembros(membroData);

      const now = new Date().toISOString();
      setLastSyncAt(now);

      await AsyncStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(aldeiaData));
      await AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(membroData));
      await AsyncStorage.setItem(STORAGE_KEYS.lastSyncAt, now);

      setSyncStatus("idle");
    } catch (err) {
      console.warn("Sync failed, operating on cached offline data:", err);
      setSyncStatus(isOnline ? "error" : "offline");
    }
  }, [syncStatus, isOnline, serverUrl, processPendingQueue]);

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
        setMembros((prev) =>
          prev.map((m) => (m.id === tempId ? savedMembro : m))
        );

        // Update local caches
        const latestMembros = membros.map((m) => (m.id === tempId ? savedMembro : m));
        if (!latestMembros.some((m) => m.id === savedMembro.id)) {
          latestMembros.push(savedMembro);
        }
        await AsyncStorage.setItem(
          STORAGE_KEYS.membros,
          JSON.stringify(latestMembros.filter((m) => m.id !== tempId))
        );
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
  }, [isOnline, serverUrl, membros]);

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
