import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
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
        router.push({
          pathname: "/membro/[id]",
          params: { id: membro.id },
        });
      }}
      activeOpacity={0.75}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
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
  const aldeia = getAldeiaById(id);
  const membros = getMembrosByAldeia(id);
  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

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
          <Text style={styles.statLabel}>membros</Text>
        </View>
        {aldeia.localizacao ? (
          <View style={styles.statItem}>
            <Feather name="map-pin" size={16} color={colors.light.primary} />
            <Text style={styles.statValue}>{aldeia.localizacao}</Text>
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
            <Feather name="users" size={48} color={colors.light.mutedForeground} />
            <Text style={styles.emptyText}>Nenhum membro nesta aldeia</Text>
          </View>
        )}
        renderItem={({ item }) => <MembroCard membro={item} />}
      />

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.OS === "web"
                ? Math.max(insets.bottom, 34)
                : insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: "/cadastro-membro",
              params: { aldeiaId: id },
            });
          }}
          activeOpacity={0.85}
        >
          <Feather name="user-plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Cadastrar Membro</Text>
        </TouchableOpacity>
      </View>
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
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    textAlign: "center",
    marginTop: 40,
  },
});
