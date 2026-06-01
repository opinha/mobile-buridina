import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Users, Search } from "lucide-react-native";
import { useApp, type Membro } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

const DEFAULT_FOTO = "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

function MembroCard({ membro, onPress }: { membro: Membro; onPress: () => void }) {
  const fotoSrc = membro.fotoUrl || DEFAULT_FOTO;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.membroCard}
    >
      <View style={styles.membroInfo}>
        <Image
          source={{ uri: fotoSrc }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.nomeEtnico}>{membro.nomeEtnico}</Text>
          <Text style={styles.nomeSocial}>{membro.nomeSocial}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#8B6347" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function AldeiaDetail() {
  const insets = useSafeAreaInsets();
  const { routeParams, getAldeiaById, getMembrosByAldeia, navigate, goBack } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const aldeiaId = routeParams?.id;
  const aldeia = aldeiaId ? getAldeiaById(aldeiaId) : undefined;
  const membros = aldeiaId ? getMembrosByAldeia(aldeiaId) : [];

  const filteredMembros = membros.filter((m) =>
    m.nomeEtnico.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nomeSocial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!aldeia) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Aldeia não encontrada.</Text>
        <TouchableOpacity onPress={goBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeft size={28} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {aldeia.nome}
          </Text>
        </View>
      </View>
      <TribalBorder />

      {/* Roster / Members List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Register New Member Button */}
        <View style={styles.registerContainer}>
          <TouchableOpacity
            onPress={() => navigate("CadastroMembro", { id: aldeia.id })}
            activeOpacity={0.8}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>✚ Cadastrar Novo Membro</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title & Member Count */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membros Registrados</Text>
          <View style={styles.countBadge}>
            <Users size={16} color="#4A2B18" />
            <Text style={styles.countText}>{membros.length}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search size={18} color="rgba(139, 99, 71, 0.6)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome social ou étnico..."
              placeholderTextColor="rgba(139, 99, 71, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* List of members */}
        {filteredMembros.length > 0 ? (
          filteredMembros.map((membro) => (
            <MembroCard
              key={membro.id}
              membro={membro}
              onPress={() => navigate("MembroDetail", { id: membro.id })}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Search size={40} color="#8B6347" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              Nenhum membro encontrado com este nome.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EFE6",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#4A2B18",
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    color: "#D4691E",
    fontSize: 16,
    fontWeight: "600",
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
    paddingHorizontal: 56,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  registerContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E3D4C0",
    paddingBottom: 20,
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#E65C00",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E65C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4A2B18",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A2B18",
  },
  searchContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E3D4C0",
    paddingBottom: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCFAF6",
    borderWidth: 1,
    borderColor: "#E6DDCC",
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#4A2B18",
    fontSize: 15,
  },
  membroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FCFAF6",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    marginBottom: 16,
    shadowColor: "#4A2B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  membroInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(212, 105, 30, 0.3)",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nomeEtnico: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#4A2B18",
    marginBottom: 2,
  },
  nomeSocial: {
    fontSize: 14,
    color: "#8B6347",
    fontWeight: "500",
  },
  emptyContainer: {
    backgroundColor: "#FCFAF6",
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    color: "#8B6347",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 15,
  },
});
