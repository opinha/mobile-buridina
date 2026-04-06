import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TribalPattern } from "@/components/TribalPattern";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

export default function CadastroMembroScreen() {
  const { aldeiaId } = useLocalSearchParams<{ aldeiaId?: string }>();
  const { aldeias, addMembro } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [nomeEtnico, setNomeEtnico] = useState("");
  const [nomeSocial, setNomeSocial] = useState("");
  const [endereco, setEndereco] = useState("");
  const [selectedAldeiaId, setSelectedAldeiaId] = useState<string>(
    aldeiaId || ""
  );
  const [showAldeiaList, setShowAldeiaList] = useState(false);

  const selectedAldeia = aldeias.find((a) => a.id === selectedAldeiaId);

  function handleCadastrar() {
    if (!nomeEtnico.trim()) {
      Alert.alert("Atenção", "O nome étnico é obrigatório.");
      return;
    }
    if (!nomeSocial.trim()) {
      Alert.alert("Atenção", "O nome social é obrigatório.");
      return;
    }
    if (!selectedAldeiaId) {
      Alert.alert("Atenção", "Selecione uma aldeia.");
      return;
    }

    addMembro({
      nomeEtnico: nomeEtnico.trim(),
      nomeSocial: nomeSocial.trim(),
      endereco: endereco.trim(),
      aldeiaId: selectedAldeiaId,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Sucesso", "Membro cadastrado com sucesso!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
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
          <Text style={styles.headerTitle}>Cadastro de Membro</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="camera" size={32} color={colors.light.mutedForeground} />
            <Text style={styles.avatarLabel}>Adicionar Foto</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Étnico *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome tradicional"
              placeholderTextColor={colors.light.mutedForeground}
              value={nomeEtnico}
              onChangeText={setNomeEtnico}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Social *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome civil"
              placeholderTextColor={colors.light.mutedForeground}
              value={nomeSocial}
              onChangeText={setNomeSocial}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Endereço</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número..."
              placeholderTextColor={colors.light.mutedForeground}
              value={endereco}
              onChangeText={setEndereco}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Aldeia *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowAldeiaList(!showAldeiaList)}
            >
              <Text
                style={[
                  styles.selectText,
                  !selectedAldeia && { color: colors.light.mutedForeground },
                ]}
              >
                {selectedAldeia ? selectedAldeia.nome : "Selecionar Aldeia"}
              </Text>
              <Feather
                name={showAldeiaList ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.light.mutedForeground}
              />
            </TouchableOpacity>

            {showAldeiaList && (
              <View style={styles.dropdown}>
                {aldeias.map((aldeia) => (
                  <TouchableOpacity
                    key={aldeia.id}
                    style={[
                      styles.dropdownItem,
                      selectedAldeiaId === aldeia.id && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedAldeiaId(aldeia.id);
                      setShowAldeiaList(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selectedAldeiaId === aldeia.id &&
                          styles.dropdownTextActive,
                      ]}
                    >
                      {aldeia.nome}
                    </Text>
                    {selectedAldeiaId === aldeia.id && (
                      <Feather
                        name="check"
                        size={16}
                        color={colors.light.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleCadastrar}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Cadastrar</Text>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.light.secondary,
    borderWidth: 2,
    borderColor: colors.light.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  avatarLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
  },
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    marginBottom: 8,
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
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: colors.light.foreground,
  },
  dropdown: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.light.secondary,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: colors.light.foreground,
  },
  dropdownTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: colors.light.primary,
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
