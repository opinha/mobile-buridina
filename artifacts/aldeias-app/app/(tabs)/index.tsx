import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { Aldeia, Membro, useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

function SyncBadge() {
  const { syncStatus, lastSyncAt, isOnline, syncNow } = useApp();

  let color = colors.light.mutedForeground;
  let label = "";

  if (!isOnline) {
    color = "#E67E22";
    label = "Offline";
  } else if (syncStatus === "syncing") {
    color = colors.light.primary;
    label = "Sincronizando...";
  } else if (syncStatus === "error") {
    color = colors.light.destructive;
    label = "Erro de sync";
  } else if (lastSyncAt) {
    color = colors.light.success;
    const d = new Date(lastSyncAt);
    label = `Sync ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <TouchableOpacity
      style={styles.syncBadge}
      onPress={() => {
        if (isOnline) syncNow();
      }}
    >
      {syncStatus === "syncing" ? (
        <ActivityIndicator size={10} color={color} />
      ) : (
        <View style={[styles.syncDot, { backgroundColor: color }]} />
      )}
      {label ? <Text style={[styles.syncLabel, { color }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

function AldeiaCard({ aldeia }: { aldeia: Aldeia }) {
  const { getMembrosByAldeia } = useApp();
  const membros = getMembrosByAldeia(aldeia.id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/aldeia/[id]", params: { id: aldeia.id } });
      }}
      activeOpacity={0.75}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <Feather name="map-pin" size={20} color={colors.light.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{aldeia.nome}</Text>
          <Text style={styles.cardSubtitle}>
            {membros.length} {membros.length === 1 ? "membro" : "membros"}
            {aldeia.localizacao ? ` · ${aldeia.localizacao}` : ""}
          </Text>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={colors.light.mutedForeground}
      />
    </TouchableOpacity>
  );
}

function MembroSearchCard({ membro }: { membro: Membro }) {
  const { getAldeiaById } = useApp();
  const aldeia = getAldeiaById(membro.aldeiaId);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/membro/[id]", params: { id: membro.id } });
      }}
      activeOpacity={0.75}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIconUser}>
          <Text style={styles.avatarText}>
            {membro.nomeEtnico.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{membro.nomeEtnico}</Text>
          <Text style={styles.cardSubtitle}>
            {membro.nomeSocial}
            {aldeia ? ` · ${aldeia.nome}` : ""}
          </Text>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={colors.light.mutedForeground}
      />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { aldeias, searchMembros } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = searchQuery.trim().length > 0
    ? searchMembros(searchQuery)
    : [];

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Feather name="layers" size={20} color={colors.light.primary} />
            </View>
            <Text style={styles.headerTitle}>Aldeias</Text>
          </View>
          <SyncBadge />
        </View>
        <TribalPattern height={6} backgroundColor={colors.light.primary} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color={colors.light.mutedForeground}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar membro por nome..."
            placeholderTextColor={colors.light.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS !== "ios" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather
                name="x"
                size={16}
                color={colors.light.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather
                name="user-x"
                size={48}
                color={colors.light.mutedForeground}
              />
              <Text style={styles.emptyText}>Nenhum membro encontrado</Text>
              <Text style={styles.emptySubtext}>
                Tente um nome diferente
              </Text>
            </View>
          )}
          renderItem={({ item }) => <MembroSearchCard membro={item} />}
        />
      ) : (
        <FlatList
          data={aldeias}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather
                name="map"
                size={48}
                color={colors.light.mutedForeground}
              />
              <Text style={styles.emptyText}>Nenhuma aldeia cadastrada</Text>
              <Text style={styles.emptySubtext}>
                Os dados serão carregados do servidor automaticamente
              </Text>
            </View>
          )}
          renderItem={({ item }) => <AldeiaCard aldeia={item} />}
        />
      )}

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
          style={styles.qrBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/scanner");
          }}
          activeOpacity={0.85}
        >
          <Feather name="maximize" size={20} color="#fff" />
          <Text style={styles.qrBtnText}>Ler QR-Code</Text>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: colors.light.headerForeground,
    letterSpacing: 0.3,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: colors.light.foreground,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.light.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconUser: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.foreground,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.light.header,
    borderRadius: 14,
    paddingVertical: 16,
  },
  qrBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
