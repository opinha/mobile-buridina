import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Save } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

export default function CadastroMembro() {
  const insets = useSafeAreaInsets();
  const { routeParams, getAldeiaById, addMembro, goBack } = useApp();

  const aldeiaId = routeParams?.id;
  const aldeia = aldeiaId ? getAldeiaById(aldeiaId) : undefined;

  const [nomeSocial, setNomeSocial] = useState("");
  const [nomeEtnico, setNomeEtnico] = useState("");
  const [endereco, setEndereco] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!aldeia) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Aldeia base não encontrada.</Text>
        <TouchableOpacity onPress={goBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSalvar = async () => {
    if (!nomeSocial.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addMembro({
        aldeiaId: aldeia.id,
        nomeSocial: nomeSocial.trim(),
        nomeEtnico: nomeEtnico.trim() || nomeSocial.trim(),
        endereco: endereco.trim() || null,
        fotoUrl: fotoUrl.trim() || null,
      });

      // Go back to AldeiaDetail
      goBack();
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeft size={28} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Membro</Text>
        </View>
      </View>
      <TribalBorder />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Linked Village Read Only Card */}
        <View style={styles.villageCard}>
          <Text style={styles.villageCardLabel}>Aldeia Vinculada (Auto)</Text>
          <Text style={styles.villageCardValue}>{aldeia.nome}</Text>
        </View>

        {/* Nome Social Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Social *</Text>
          <TextInput
            style={styles.input}
            value={nomeSocial}
            onChangeText={setNomeSocial}
            placeholder="Nome oficial completo..."
            placeholderTextColor="rgba(74, 43, 24, 0.4)"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Nome Étnico Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Étnico (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={nomeEtnico}
            onChangeText={setNomeEtnico}
            placeholder="Nome indígena, se houver..."
            placeholderTextColor="rgba(74, 43, 24, 0.4)"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Endereço Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Endereço / Local (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Ex: Aldeia Sede, Tenda 3..."
            placeholderTextColor="rgba(74, 43, 24, 0.4)"
            autoCapitalize="sentences"
          />
        </View>

        {/* Foto URL Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Foto (URL / Opcional)</Text>
          <TextInput
            style={styles.input}
            value={fotoUrl}
            onChangeText={setFotoUrl}
            placeholder="https://..."
            placeholderTextColor="rgba(74, 43, 24, 0.4)"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSalvar}
          disabled={!nomeSocial.trim() || isSubmitting}
          activeOpacity={0.8}
          style={[
            styles.saveButton,
            (!nomeSocial.trim() || isSubmitting) && styles.disabledButton,
          ]}
        >
          <Save size={20} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.saveButtonText}>
            {isSubmitting ? "Salvando..." : "Salvar Membro"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  villageCard: {
    backgroundColor: "#FCFAF6",
    borderWidth: 1,
    borderColor: "#E6DDCC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#4A2B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  villageCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B6347",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  villageCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2B18",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A2B18",
    marginLeft: 4,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6DDCC",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#4A2B18",
  },
  saveButton: {
    flexDirection: "row",
    height: 56,
    backgroundColor: "#3D8B3D",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    shadowColor: "#3D8B3D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
