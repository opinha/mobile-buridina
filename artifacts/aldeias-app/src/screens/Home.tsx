import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, Settings, Check, Wifi, WifiOff } from "lucide-react-native";
import { useApp, type Aldeia } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

function AldeiaCard({ aldeia, onPress }: { aldeia: Aldeia; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{aldeia.nome}</Text>
      <ChevronRight size={20} color="#4A2B18" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { aldeias, navigate, serverUrl, updateServerUrl, isOnline } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverUrl);

  const handleSaveUrl = () => {
    updateServerUrl(inputUrl);
    setShowSettings(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* Universal Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Aldeias Digitais</Text>
          <TouchableOpacity 
            onPress={() => setShowSettings(!showSettings)}
            activeOpacity={0.7} 
            style={styles.settingsButton}
          >
            <Settings size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      <TribalBorder />

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <View style={styles.settingsHeader}>
            <Text style={styles.panelTitle}>Configurações</Text>
            <View style={styles.networkStatus}>
              {isOnline ? (
                <Wifi size={14} color="#4ADE80" />
              ) : (
                <WifiOff size={14} color="#F87171" />
              )}
              <Text style={[styles.networkText, { color: isOnline ? "#4ADE80" : "#F87171" }]}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
          <Text style={styles.panelDescription}>Endereço do Servidor Backend:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="http://192.168.1.XX:3000"
              placeholderTextColor="rgba(74, 43, 24, 0.4)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleSaveUrl}
              style={styles.saveButton}
              activeOpacity={0.8}
            >
              <Check size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {aldeias.map((aldeia) => (
          <AldeiaCard
            key={aldeia.id}
            aldeia={aldeia}
            onPress={() => navigate("AldeiaDetail", { id: aldeia.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFE6",
  },
  header: {
    backgroundColor: "#4A2B18",
    width: "100%",
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  settingsButton: {
    position: "absolute",
    right: 20,
    padding: 4,
  },
  settingsPanel: {
    backgroundColor: "#FCFAF6",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2B18",
  },
  networkStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  networkText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  panelDescription: {
    fontSize: 12,
    color: "#8B6347",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6DDCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#4A2B18",
    fontSize: 14,
  },
  saveButton: {
    width: 44,
    height: 44,
    backgroundColor: "#3D8B3D",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FCFAF6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    marginBottom: 16,
    // Shadow styling
    shadowColor: "#4A2B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#4A2B18",
  },
});
