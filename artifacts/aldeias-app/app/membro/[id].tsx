import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import QRCode from "@/components/QRCode";

export default function MembroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMembroById, getAldeiaById } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const membro = getMembroById(id);
  const aldeia = membro ? getAldeiaById(membro.aldeiaId) : undefined;

  if (!membro) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Membro não encontrado</Text>
      </View>
    );
  }

  const initials = membro.nomeEtnico
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const qrData = JSON.stringify({
    id: membro.id,
    nomeEtnico: membro.nomeEtnico,
    nomeSocial: membro.nomeSocial,
    aldeia: aldeia?.nome || "",
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            style={styles.backBtn}
          >
            <Feather
              name="arrow-left"
              size={22}
              color={colors.light.headerForeground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cartão de Identificação</Text>
          <View style={{ width: 40 }} />
        </View>
        <TribalPattern height={6} backgroundColor={colors.light.primary} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === "web"
                ? Math.max(insets.bottom, 34) + 24
                : insets.bottom + 40,
          },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>{initials}</Text>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.nomeEtnico}>{membro.nomeEtnico}</Text>
              <View style={styles.aldeiaBadge}>
                <Feather
                  name="map-pin"
                  size={12}
                  color={colors.light.primary}
                />
                <Text style={styles.aldeiaBadgeText}>
                  {aldeia?.nome || "Aldeia desconhecida"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="user" size={15} color={colors.light.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome Social</Text>
                <Text style={styles.infoValue}>{membro.nomeSocial}</Text>
              </View>
            </View>

            {membro.endereco ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Feather
                    name="home"
                    size={15}
                    color={colors.light.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <Text style={styles.infoValue}>{membro.endereco}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather
                  name="layers"
                  size={15}
                  color={colors.light.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Aldeia</Text>
                <Text style={styles.infoValue}>
                  {aldeia?.nome || "Não informada"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Código de Identificação</Text>
            <QRCode value={qrData} size={180} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: colors.light.header,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  bigAvatarText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  nameSection: {
    flex: 1,
    gap: 8,
  },
  nomeEtnico: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  aldeiaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  aldeiaBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: 20,
  },
  infoList: {
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.light.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: colors.light.foreground,
  },
  qrSection: {
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  qrLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    textAlign: "center",
    marginTop: 40,
  },
});
