import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

interface ScannedMembro {
  id: string;
  nomeEtnico: string;
  nomeSocial: string;
  aldeia: string;
}

export default function ScannerScreen() {
  const { getMembroById } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const [scannedData, setScannedData] = useState<ScannedMembro | null>(null);
  const [scanning, setScanning] = useState(false);

  function handleDemoScan() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    setTimeout(() => {
      const membro = getMembroById("membro-1");
      if (membro) {
        setScannedData({
          id: membro.id,
          nomeEtnico: membro.nomeEtnico,
          nomeSocial: membro.nomeSocial,
          aldeia: "Aldeia Arapó",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setScannedData({
          id: "demo",
          nomeEtnico: "Akaié",
          nomeSocial: "João Silva",
          aldeia: "Aldeia Arapó",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setScanning(false);
    }, 1500);
  }

  function handleClear() {
    setScannedData(null);
    Haptics.selectionAsync();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather
              name="arrow-left"
              size={22}
              color={colors.light.headerForeground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leitor de QR Code</Text>
          <View style={styles.cameraIconBtn}>
            <Feather name="camera" size={20} color={colors.light.headerForeground} />
          </View>
        </View>
        <TribalPattern height={6} backgroundColor={colors.light.primary} />
      </View>

      <View style={styles.scanArea}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          {scanning && <View style={styles.scanLine} />}
          <View style={styles.cameraPlaceholder}>
            <Feather
              name="maximize"
              size={64}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.placeholderText}>
              {scanning ? "Escaneando..." : "Posicione o QR Code aqui"}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.bottomSection,
          {
            paddingBottom:
              Platform.OS === "web"
                ? Math.max(insets.bottom, 34) + 16
                : insets.bottom + 24,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.scanBtnDisabled]}
          onPress={handleDemoScan}
          disabled={scanning}
          activeOpacity={0.85}
        >
          <Feather name="zap" size={20} color="#fff" />
          <Text style={styles.scanBtnText}>
            {scanning ? "Escaneando..." : "Escanear Código"}
          </Text>
        </TouchableOpacity>

        {scannedData && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={16} color={colors.light.success} />
                <Text style={styles.verifiedText}>Membro Verificado</Text>
              </View>
              <TouchableOpacity onPress={handleClear}>
                <Feather name="x" size={18} color={colors.light.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultInfo}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Nome Étnico:</Text>
                <Text style={styles.resultValue}>{scannedData.nomeEtnico}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Nome Social:</Text>
                <Text style={styles.resultValue}>{scannedData.nomeSocial}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Aldeia:</Text>
                <Text style={styles.resultValue}>{scannedData.aldeia}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => {
                if (scannedData.id !== "demo") {
                  router.push({
                    pathname: "/membro/[id]",
                    params: { id: scannedData.id },
                  });
                }
              }}
            >
              <Text style={styles.viewProfileText}>Ver Cartão de Identidade</Text>
              <Feather name="arrow-right" size={16} color={colors.light.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0E08",
  },
  header: {
    backgroundColor: colors.light.header,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: colors.light.headerForeground,
    flex: 1,
    textAlign: "center",
  },
  cameraIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  viewfinder: {
    width: 260,
    height: 260,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#00E676",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00E676",
    top: "50%",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  cameraPlaceholder: {
    alignItems: "center",
    gap: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  scanBtnDisabled: {
    opacity: 0.6,
  },
  scanBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  resultCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  resultInfo: {
    padding: 16,
    gap: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    minWidth: 90,
  },
  resultValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.foreground,
    flex: 1,
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  viewProfileText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.primary,
  },
});
