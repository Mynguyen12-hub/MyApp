import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

interface AddressManagementProps {
  addresses: Address[];
  onBack: () => void;
  onSelectAddress: (address: Address) => void;
  onAddAddress?: () => void;
}

export function AddressManagement({
  addresses,
  onBack,
  onSelectAddress,
  onAddAddress,
}: AddressManagementProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    addresses[0] || null
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleSaveAddress = () => {
    if (selectedAddress) {
      onSelectAddress(selectedAddress);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ADDRESS LIST */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Find addresses</Text>

          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectAddress(item)}
                style={[
                  styles.addressCard,
                  selectedAddress?.id === item.id && styles.addressCardSelected,
                ]}
              >
                <View style={styles.addressIconContainer}>
                  <Ionicons
                    name="location"
                    size={24}
                    color={selectedAddress?.id === item.id ? "#fff" : "#e91e63"}
                  />
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressName}>{item.name}</Text>
                  <Text style={styles.addressDetails}>
                    {item.street}, {item.city}
                  </Text>
                  <Text style={styles.addressPhone}>{item.phone}</Text>
                </View>
                {selectedAddress?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#e91e63" />
                )}
              </TouchableOpacity>
            )}
          />

          {/* CHOOSE ANOTHER OPTION */}
          <TouchableOpacity
            onPress={onAddAddress}
            style={styles.chooseAnotherButton}
          >
            <View style={styles.chooseAnotherIcon}>
              <Ionicons name="add-circle" size={32} color="#e91e63" />
            </View>
            <View>
              <Text style={styles.chooseAnotherTitle}>Choose another</Text>
              <Text style={styles.chooseAnotherSubtitle}>
                Add a new address or change
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* CHOOSE LOCATION SECTION */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Choose location</Text>

          {/* MAP PLACEHOLDER */}
          <View style={styles.mapContainer}>
            <Image
              source={require("../assets/images/hoahong.jpg")}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={40} color="#e91e63" />
            </View>
          </View>

          {/* USE CURRENT LOCATION TOGGLE */}
          <TouchableOpacity
            style={styles.locationToggle}
            onPress={() => setUseCurrentLocation(!useCurrentLocation)}
          >
            <View style={styles.toggleIcon}>
              <Ionicons
                name={useCurrentLocation ? "checkmark-circle" : "radio-button-off"}
                size={24}
                color={useCurrentLocation ? "#e91e63" : "#ccc"}
              />
            </View>
            <Text style={styles.toggleText}>Use my current location</Text>
          </TouchableOpacity>

          {/* COUNTRY/REGION */}
          <TouchableOpacity style={styles.countryButton}>
            <Text style={styles.countryText}>Country/Region</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SAVE ADDRESS BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSaveAddress}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
  },
  addressCardSelected: {
    backgroundColor: "#fff",
    borderColor: "#e91e63",
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fdf6f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: "#999",
  },
  chooseAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
    marginTop: 8,
  },
  chooseAnotherIcon: {
    marginRight: 12,
  },
  chooseAnotherTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  chooseAnotherSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  locationSection: {
    marginBottom: 24,
  },
  mapContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },
  locationToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleText: {
    fontSize: 14,
    color: "#333",
  },
  countryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
  },
  countryText: {
    fontSize: 14,
    color: "#333",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
