import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { AppProvider, useApp } from "./src/context/AppContext";
import { Layout } from "./src/components/Layout";

// Screen components
import Login from "./src/screens/Login";
import Home from "./src/screens/Home";
import Scanner from "./src/screens/Scanner";
import AldeiaDetail from "./src/screens/AldeiaDetail";
import MembroDetail from "./src/screens/MembroDetail";
import CadastroMembro from "./src/screens/CadastroMembro";

const queryClient = new QueryClient();

function ScreenRouter() {
  const { currentRoute } = useApp();

  switch (currentRoute) {
    case "Login":
      return <Login />;
    case "Home":
      return <Home />;
    case "Scanner":
      return <Scanner />;
    case "AldeiaDetail":
      return <AldeiaDetail />;
    case "MembroDetail":
      return <MembroDetail />;
    case "CadastroMembro":
      return <CadastroMembro />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4EFE6" }}>
          <Text style={{ color: "#4A2B18", fontWeight: "bold" }}>Tela não encontrada: {currentRoute}</Text>
        </View>
      );
  }
}

function MainApp() {
  return (
    <Layout>
      <ScreenRouter />
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <MainApp />
        </AppProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
