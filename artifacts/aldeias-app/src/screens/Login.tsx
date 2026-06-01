import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, Check, Wifi, WifiOff } from "lucide-react-native";
import { useApp } from "../context/AppContext";

export default function Login() {
  const insets = useSafeAreaInsets();
  const { navigate, serverUrl, updateServerUrl, isOnline } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverUrl);

  const handleSaveUrl = () => {
    updateServerUrl(inputUrl);
    setShowSettings(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../assets/bg-login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Dark overlay to match web app text readability */}
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Top Header Controls (Settings & Network Indicator) */}
          <View style={[styles.topControls, { top: insets.top + 16 }]}>
            {/* Connection Status Icon */}
            <View style={styles.networkStatus}>
              {isOnline ? (
                <Wifi size={18} color="#4ADE80" />
              ) : (
                <WifiOff size={18} color="#F87171" />
              )}
              <Text style={[styles.networkText, { color: isOnline ? "#4ADE80" : "#F87171" }]}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>

            {/* Settings button */}
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              activeOpacity={0.7}
              style={styles.settingsButton}
            >
              <Settings size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Settings Panel */}
          {showSettings && (
            <View style={[styles.settingsPanel, { top: insets.top + 60 }]}>
              <Text style={styles.panelTitle}>Configurações do Servidor</Text>
              <Text style={styles.panelDescription}>Endereço da API Backend:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputUrl}
                  onChangeText={setInputUrl}
                  placeholder="http://192.168.1.XX:3000"
                  placeholderTextColor="#8B6347"
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

          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Aldeias Digitais</Text>
          </View>

          {/* Bottom Section */}
          <View style={[styles.bottomSection, { marginBottom: insets.bottom + 24 }]}>
            <TouchableOpacity
              onPress={() => navigate("Home")}
              activeOpacity={0.85}
              style={styles.enterButton}
            >
              <Text style={styles.enterButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#4A2B18",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  topControls: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 30,
  },
  networkStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  networkText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  settingsPanel: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#FCFAF6",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 29,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2B18",
    marginBottom: 4,
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
  topSection: {
    marginTop: "40%",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
  },
  enterButton: {
    width: "100%",
    maxWidth: 300,
    height: 60,
    backgroundColor: "#E65C00",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E65C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  enterButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
