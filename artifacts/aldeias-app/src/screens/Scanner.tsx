import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Zap, Camera } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

// Safely import CameraView — this can fail if expo-camera native module is missing
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (err) {
  console.warn("expo-camera not available:", err);
}

function CameraScanner({ onScan }: { onScan: (data: string) => void }) {
  if (!useCameraPermissions || !CameraView) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={48} color="#8B6347" style={{ marginBottom: 16, opacity: 0.5 }} />
        <Text style={styles.permissionText}>
          Câmera não disponível neste dispositivo.
        </Text>
      </View>
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    setScanned(false);
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  if (!permission) {
    return (
      <View style={[styles.permissionContainer]}>
        <Text style={styles.permissionText}>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Precisamos de permissão para acessar a câmera e escanear os cartões.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {/* Overlay Label */}
      <View style={styles.overlayLabelContainer}>
        <View style={styles.overlayLabel}>
          <Text style={styles.overlayLabelText}>Aponte para o código</Text>
        </View>
      </View>
    </>
  );
}

export default function Scanner() {
  const insets = useSafeAreaInsets();
  const { navigate, goBack } = useApp();

  const handleScan = (v: string) => {
    try {
      if (v.startsWith("aldeia:")) {
        navigate("AldeiaDetail", { id: v.split(":")[1] });
      } else if (v.startsWith("membro:")) {
        navigate("MembroDetail", { id: v.split(":")[1] });
      } else {
        Alert.alert("QR Code Lido", v, [{ text: "OK" }]);
      }
    } catch (err) {
      console.error("handleScan error:", err);
      Alert.alert("Erro", "Falha ao processar QR Code.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeft size={28} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR</Text>
        </View>
      </View>
      <TribalBorder />

      {/* Camera Body */}
      <View style={styles.cameraContainer}>
        <CameraScanner onScan={handleScan} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  backButton: {
    position: "absolute",
    left: 16,
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#1C1917",
  },
  permissionText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#E65C00",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlayLabelContainer: {
    position: "absolute",
    top: 32,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  overlayLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  overlayLabelText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  simulateContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  simulateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D4691E",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  simulateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
