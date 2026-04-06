import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
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

function MembroCard({ membro }: { membro: Membro }) {
  const initials = membro.nomeEtnico
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.membroCard}
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/membro/[id]", params: { id: membro.id } });
      }}
      activeOpacity={0.75}
    >
      {membro.fotoUrl ? (
        <Image source={{ uri: membro.fotoUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}
      <View style={styles.membroInfo}>
        <Text style={styles.membroEtnico}>{membro.nomeEtnico}</Text>
        <Text style={styles.membroSocial}>{membro.nomeSocial}</Text>
      </View>
      <Feather
        name="chevron-right"
        size={18}
        color={colors.light.mutedForeground}
      />
    </TouchableOpacity>
  );
}

export default function AldeiaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAldeiaById, getMembrosByAldeia } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const aldeia = getAldeiaById(id);
  const membros = getMembrosByAldeia(id);

  if (!aldeia) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aldeia não encontrada</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {aldeia.nome}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <TribalPattern height={6} backgroundColor={colors.light.primary} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Feather name="users" size={16} color={colors.light.primary} />
          <Text style={styles.statValue}>{membros.length}</Text>
          <Text style={styles.statLabel}>
            {membros.length === 1 ? "membro" : "membros"}
          </Text>
        </View>
        {aldeia.localizacao ? (
          <View style={styles.statItem}>
            <Feather name="map-pin" size={16} color={colors.light.primary} />
            <Text style={styles.statValue}>{aldeia.localizacao}</Text>
          </View>
        ) : null}
        {aldeia.descricao ? (
          <View style={[styles.statItem, { flex: 1 }]}>
            <Feather name="info" size={16} color={colors.light.primary} />
            <Text
              style={styles.statLabel}
              numberOfLines={1}
            >
              {aldeia.descricao}
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={membros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather
              name="users"
              size={48}
              color={colors.light.mutedForeground}
            />
            <Text style={styles.emptyText}>Nenhum membro nesta aldeia</Text>
            <Text style={styles.emptySubtext}>
              Os dados são sincronizados automaticamente do servidor
            </Text>
          </View>
        )}
        renderItem={({ item }) => <MembroCard membro={item} />}
      />
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
    paddingBottom: 0,
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
  statsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.foreground,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  membroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  membroInfo: {
    flex: 1,
    gap: 2,
  },
  membroEtnico: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.foreground,
  },
  membroSocial: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    textAlign: "center",
    marginTop: 40,
  },
});
