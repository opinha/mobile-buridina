import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Aldeia {
  id: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  membrosCount?: number;
}

export interface Membro {
  id: string;
  nomeEtnico: string;
  nomeSocial: string;
  endereco: string;
  aldeiaId: string;
  foto?: string;
  createdAt: string;
}

interface AppContextValue {
  aldeias: Aldeia[];
  membros: Membro[];
  addAldeia: (aldeia: Omit<Aldeia, "id" | "membrosCount">) => void;
  addMembro: (membro: Omit<Membro, "id" | "createdAt">) => void;
  getMembrosByAldeia: (aldeiaId: string) => Membro[];
  getAldeiaById: (id: string) => Aldeia | undefined;
  getMembroById: (id: string) => Membro | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  aldeias: "@aldeias_app:aldeias",
  membros: "@aldeias_app:membros",
};

const INITIAL_ALDEIAS: Aldeia[] = [
  {
    id: "aldeia-arapo",
    nome: "Aldeia Arapó",
    descricao: "Aldeia tradicional da região norte",
    localizacao: "Região Norte",
  },
  {
    id: "aldeia-tupa",
    nome: "Aldeia Tupà",
    descricao: "Aldeia dos guardiões da floresta",
    localizacao: "Região Sul",
  },
];

const INITIAL_MEMBROS: Membro[] = [
  {
    id: "membro-1",
    nomeEtnico: "Akaié",
    nomeSocial: "João Silva",
    endereco: "Rua das Palmeiras, 123",
    aldeiaId: "aldeia-arapo",
    createdAt: new Date().toISOString(),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEYS.aldeias, JSON.stringify(aldeias));
    }
  }, [aldeias, loaded]);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEYS.membros, JSON.stringify(membros));
    }
  }, [membros, loaded]);

  async function loadData() {
    try {
      const [aldeiaData, membroData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.aldeias),
        AsyncStorage.getItem(STORAGE_KEYS.membros),
      ]);

      setAldeias(aldeiaData ? JSON.parse(aldeiaData) : INITIAL_ALDEIAS);
      setMembros(membroData ? JSON.parse(membroData) : INITIAL_MEMBROS);
    } catch {
      setAldeias(INITIAL_ALDEIAS);
      setMembros(INITIAL_MEMBROS);
    } finally {
      setLoaded(true);
    }
  }

  function addAldeia(data: Omit<Aldeia, "id" | "membrosCount">) {
    const newAldeia: Aldeia = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setAldeias((prev) => [...prev, newAldeia]);
  }

  function addMembro(data: Omit<Membro, "id" | "createdAt">) {
    const newMembro: Membro = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setMembros((prev) => [...prev, newMembro]);
  }

  function getMembrosByAldeia(aldeiaId: string) {
    return membros.filter((m) => m.aldeiaId === aldeiaId);
  }

  function getAldeiaById(id: string) {
    return aldeias.find((a) => a.id === id);
  }

  function getMembroById(id: string) {
    return membros.find((m) => m.id === id);
  }

  return (
    <AppContext.Provider
      value={{
        aldeias,
        membros,
        addAldeia,
        addMembro,
        getMembrosByAldeia,
        getAldeiaById,
        getMembroById,
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
