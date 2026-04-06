import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { Membro, useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

type ScanState = "idle" | "scanning" | "found" | "not_found";

interface QRPayload {
  id?: string;
  nomeEtnico?: string;
  nomeSocial?: string;
  aldeia?: string;
}

function parseQR(raw: string): QRPayload | null {
  try {
    return JSON.parse(raw);
  } catch {
    // maybe just an ID
    if (raw.length > 0) return { id: raw };
    return null;
  }
}

function VerificationBadge({
  membro,
  aldeiaName,
}: {
  membro: Membro;
  aldeiaName: string;
}) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.verifiedBadge}>
          <Feather name="check-circle" size={18} color={colors.light.success} />
          <Text style={styles.verifiedText}>Membro Verificado</Text>
        </View>
        <View style={styles.aldeiaTag}>
          <Text style={styles.aldeiaTagText}>{aldeiaName}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.resultInfo}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Nome Étnico</Text>
          <Text style={styles.resultValue}>{membro.nomeEtnico}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Nome Social</Text>
          <Text style={styles.resultValue}>{membro.nomeSocial}</Text>
        </View>
        {membro.endereco ? (
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Endereço</Text>
            <Text style={styles.resultValue}>{membro.endereco}</Text>
          </View>
        ) : null}
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Aldeia</Text>
          <Text style={styles.resultValue}>{aldeiaName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewProfileBtn}
        onPress={() =>
          router.push({ pathname: "/membro/[id]", params: { id: membro.id } })
        }
      >
        <Text style={styles.viewProfileText}>Ver Cartão Completo</Text>
        <Feather name="arrow-right" size={16} color={colors.light.primary} />
      </TouchableOpacity>
    </View>
  );
}

function NotFoundCard() {
  return (
    <View style={[styles.resultCard, styles.notFoundCard]}>
      <View style={styles.resultHeader}>
        <View style={styles.notFoundBadge}>
          <Feather name="alert-circle" size={18} color={colors.light.destructive} />
          <Text style={styles.notFoundText}>Não Encontrado</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.notFoundDesc}>
        Este QR Code não corresponde a nenhum membro cadastrado.
      </Text>
    </View>
  );
}

export default function ScannerScreen() {
  const { getMembroById, getAldeiaById, membros } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [foundMembro, setFoundMembro] = useState<Membro | null>(null);
  const [aldeiaName, setAldeiaName] = useState("");

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanState === "scanning") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [scanState]);

  function handleScan(rawQR: string) {
    const payload = parseQR(rawQR);
    if (!payload?.id) {
      setScanState("not_found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const membro = getMembroById(payload.id);
    if (membro) {
      const aldeia = getAldeiaById(membro.aldeiaId);
      setFoundMembro(membro);
      setAldeiaName(aldeia?.nome ?? "Aldeia");
      setScanState("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setScanState("not_found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleDemoScan() {
    setScanState("scanning");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      if (membros.length > 0) {
        const m = membros[0];
        handleScan(JSON.stringify({ id: m.id }));
      } else {
        setScanState("not_found");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 1800);
  }

  function handleReset() {
    setScanState("idle");
    setFoundMembro(null);
    setAldeiaName("");
    Haptics.selectionAsync();
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

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
          <View style={styles.camIcon}>
            <Feather
              name="camera"
              size={20}
              color={colors.light.headerForeground}
            />
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

          {scanState === "scanning" && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslate }] },
              ]}
            />
          )}

          {scanState === "found" && (
            <View style={styles.successOverlay}>
              <Feather name="check-circle" size={56} color={colors.light.success} />
            </View>
          )}
          {scanState === "not_found" && (
            <View style={styles.errorOverlay}>
              <Feather name="x-circle" size={56} color={colors.light.destructive} />
            </View>
          )}
          {scanState === "idle" && (
            <View style={styles.idleOverlay}>
              <Feather name="maximize" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.idleText}>Posicione o QR Code aqui</Text>
            </View>
          )}
          {scanState === "scanning" && (
            <View style={styles.idleOverlay}>
              <ActivityIndicator color={colors.light.primary} size="large" />
              <Text style={styles.idleText}>Identificando...</Text>
            </View>
          )}
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
        {(scanState === "found" || scanState === "not_found") && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Feather name="refresh-cw" size={16} color={colors.light.primary} />
            <Text style={styles.resetBtnText}>Escanear Novamente</Text>
          </TouchableOpacity>
        )}

        {scanState === "idle" && (
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={handleDemoScan}
            activeOpacity={0.85}
          >
            <Feather name="zap" size={20} color="#fff" />
            <Text style={styles.scanBtnText}>Escanear Código</Text>
          </TouchableOpacity>
        )}

        {scanState === "found" && foundMembro && (
          <VerificationBadge membro={foundMembro} aldeiaName={aldeiaName} />
        )}

        {scanState === "not_found" && <NotFoundCard />}
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
  camIcon: {
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
    paddingHorizontal: 40,
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(39,174,96,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(192,57,43,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  idleOverlay: {
    alignItems: "center",
    gap: 16,
  },
  idleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
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
  scanBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  resetBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: colors.light.primary,
  },
  resultCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  notFoundCard: {
    borderWidth: 1,
    borderColor: colors.light.destructive + "40",
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
  aldeiaTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.light.secondary,
    borderRadius: 20,
  },
  aldeiaTagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.light.primary,
  },
  notFoundBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notFoundText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.destructive,
  },
  notFoundDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
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
    gap: 2,
  },
  resultLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.foreground,
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
