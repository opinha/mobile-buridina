import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { Aldeia, useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

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

function AddAldeiaModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addAldeia } = useApp();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const insets = useSafeAreaInsets();

  function handleSave() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome da aldeia é obrigatório.");
      return;
    }
    addAldeia({ nome: nome.trim(), descricao, localizacao });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNome("");
    setDescricao("");
    setLocalizacao("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Nova Aldeia</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.light.foreground} />
          </TouchableOpacity>
        </View>

        <TribalPattern />

        <View style={styles.modalBody}>
          <Text style={styles.inputLabel}>Nome da Aldeia *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Aldeia Guarani"
            placeholderTextColor={colors.light.mutedForeground}
            value={nome}
            onChangeText={setNome}
          />
          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Descrição breve"
            placeholderTextColor={colors.light.mutedForeground}
            value={descricao}
            onChangeText={setDescricao}
          />
          <Text style={styles.inputLabel}>Localização</Text>
          <TextInput
            style={styles.input}
            placeholder="Região / Estado"
            placeholderTextColor={colors.light.mutedForeground}
            value={localizacao}
            onChangeText={setLocalizacao}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Cadastrar Aldeia</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const { aldeias } = useApp();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Feather name="layers" size={20} color={colors.light.primary} />
            </View>
            <Text style={styles.headerTitle}>Aldeias</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/scanner")}
            style={styles.bellBtn}
          >
            <Feather name="camera" size={22} color={colors.light.headerForeground} />
          </TouchableOpacity>
        </View>
        <TribalPattern height={6} backgroundColor={colors.light.primary} />
      </View>

      <FlatList
        data={aldeias}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="map" size={48} color={colors.light.mutedForeground} />
            <Text style={styles.emptyText}>Nenhuma aldeia cadastrada</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão abaixo para adicionar
            </Text>
          </View>
        )}
        renderItem={({ item }) => <AldeiaCard aldeia={item} />}
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
            setShowModal(true);
          }}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Cadastrar Aldeia</Text>
        </TouchableOpacity>
      </View>

      <AddAldeiaModal visible={showModal} onClose={() => setShowModal(false)} />
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
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  listContent: {
    padding: 16,
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
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.light.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
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
  separator: {
    height: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.mutedForeground,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.light.header,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  modalBody: {
    padding: 20,
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: colors.light.foreground,
  },
  saveBtn: {
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
