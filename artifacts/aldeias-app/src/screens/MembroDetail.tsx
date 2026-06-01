import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { useApp } from "../context/AppContext";
import { TribalBorder } from "../components/TribalBorder";

const DEFAULT_FOTO = "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

export default function MembroDetail() {
  const insets = useSafeAreaInsets();
  const { routeParams, getMembroById, getAldeiaById, goBack } = useApp();

  const membroId = routeParams?.id;
  const membro = membroId ? getMembroById(membroId) : undefined;
  const aldeia = membro ? getAldeiaById(membro.aldeiaId) : undefined;

  if (!membro) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Cartão não encontrado.</Text>
        <TouchableOpacity onPress={goBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar para início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fotoSrc = membro.fotoUrl || DEFAULT_FOTO;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeft size={28} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cartão de Identificação</Text>
        </View>
      </View>
      <TribalBorder />

      {/* Identity Card Scroll Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Photo Section */}
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: fotoSrc }}
              style={styles.photo}
              resizeMode="cover"
            />
            {/* Banner Name */}
            <View style={styles.nameBanner}>
              <Text style={styles.nameText} numberOfLines={1}>
                {membro.nomeEtnico}
              </Text>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome Social:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {membro.nomeSocial}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Endereço:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {membro.endereco || "N/A"}
              </Text>
            </View>

            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Aldeia:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {aldeia ? aldeia.nome : "Desconhecida"}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={`membro:${membro.id}`}
                size={140}
                color="#2C1810"
                backgroundColor="#FFF"
              />
            </View>
          </View>
        </View>
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
    color: "#E65C00",
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
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    backgroundColor: "#F4EFE6",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E6DDCC",
    overflow: "hidden",
    // Shadow styling
    shadowColor: "#4A2B18",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  photoWrapper: {
    width: "100%",
    backgroundColor: "#F4EFE6",
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: "center",
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 43, 24, 0.1)",
  },
  nameBanner: {
    width: "100%",
    backgroundColor: "#4A2B18",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E3D4C0",
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4A2B18",
    opacity: 0.8,
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A2B18",
    flex: 1,
    flexWrap: "wrap",
  },
  qrContainer: {
    width: "100%",
    backgroundColor: "#F4EFE6",
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qrWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3D4C0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
