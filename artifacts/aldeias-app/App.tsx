import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppProvider, useApp } from "./src/context/AppContext";
import { Layout } from "./src/components/Layout";

// Screen components
import Home from "./src/screens/Home";
import Scanner from "./src/screens/Scanner";
import AldeiaDetail from "./src/screens/AldeiaDetail";
import MembroDetail from "./src/screens/MembroDetail";

// Error Boundary to prevent total crash
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>⚠️</Text>
          <Text style={errorStyles.title}>Ops! Algo deu errado</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || "Erro inesperado"}
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFE6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2B18",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#8B6347",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#E65C00",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

function ScreenRouter() {
  const { currentRoute } = useApp();

  try {
    switch (currentRoute) {
      case "Home":
        return <Home />;
      case "Scanner":
        return <Scanner />;
      case "AldeiaDetail":
        return <AldeiaDetail />;
      case "MembroDetail":
        return <MembroDetail />;
      default:
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4EFE6" }}>
            <Text style={{ color: "#4A2B18", fontWeight: "bold" }}>Tela não encontrada: {currentRoute}</Text>
          </View>
        );
    }
  } catch (err) {
    console.error("ScreenRouter error:", err);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4EFE6" }}>
        <Text style={{ color: "#4A2B18", fontWeight: "bold" }}>Erro ao carregar tela</Text>
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <MainApp />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
