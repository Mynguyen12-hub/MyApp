import Ionicons from "@expo/vector-icons/Ionicons";
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from '../config/firestore';
import { Address } from "../data/addressData";

const auth = getAuth();

import { Commune, District, Province, VIETNAM_PROVINCES } from '../data/vietnamAdministrative';
// Xóa địa chỉ khỏi Firestore theo doc id động
async function deleteAddressFromFirebase(addressId: string) {
  try {
    await deleteDoc(doc(db, 'addresses', addressId));
  } catch (e) {
    console.error('Lỗi xóa địa chỉ trên Firebase:', e);
  }
}
// Lưu địa chỉ lên Firestore với id động
async function saveAddressToFirebase(address: Address) {
  try {
    await setDoc(doc(db, 'addresses', address.id), address);
  } catch (e) {
    console.error('Lỗi lưu địa chỉ lên Firebase:', e);
  }
}
interface Props {
  onBack: () => void;
  onSelectAddress?: (address: Address) => void;
}

// Custom hook for address management - can be used anywhere
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const userId = auth.currentUser?.uid;

  /* ===== LOAD ADDRESS FROM FIREBASE ===== */
  React.useEffect(() => {
    if (!userId) return;

    const loadAddresses = async () => {
      try {
        const snap = await getDocs(
          collection(db, "users", userId, "addresses")
        );

        const list: Address[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Address, "id">),
        }));

        setAddresses(list);
        setSelectedAddress(
          list.find(a => a.isDefault) || list[0] || null
        );
      } catch (e) {
        console.log("Load address error:", e);
      }
    };

    loadAddresses();
  }, [userId]);

  /* ===== ACTIONS ===== */
  const updateAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
  };

  const selectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const addAddress = async (address: Address) => {
    if (!userId) return;
    await setDoc(
      doc(db, "users", userId, "addresses", address.id),
      address
    );
    setAddresses(prev => [...prev, address]);
  };

  const removeAddress = async (id: string) => {
    if (!userId) return;
    await deleteDoc(
      doc(db, "users", userId, "addresses", id)
    );
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return {
    addresses,
    selectedAddress,
    setAddresses: updateAddresses,
    selectAddress,
    addAddress,
    removeAddress,
  };
}

interface AddressManagementProps {
  addresses?: Address[];
  onBack: () => void;
  onSelectAddress: (address: Address) => void;
  onAddAddress: (address: Address) => void;
  onRemoveAddress?: (id: string) => void;
}

export function AddressManagement({
  addresses = [], // ✅ cực kỳ quan trọng
  onBack,
  onSelectAddress,
  onAddAddress,
  onRemoveAddress,
}: AddressManagementProps) {
const [selectedAddress, setSelectedAddress] = useState<Address | null>(
  addresses.length > 0 ? addresses[0] : null
);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  // Thêm state cho chọn tỉnh, huyện, xã
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formType, setFormType] = useState<'Văn Phòng' | 'Nhà Riêng'>('Văn Phòng');

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormPhone('');
    setFormStreet('');
    setFormCity('');
    setFormIsDefault(false);
    setFormType('Văn Phòng');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setShowAddModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingId(address.id);
    setFormName(address.name || '');
    setFormPhone(address.phone || '');
    setFormStreet(address.street || '');
    setFormCity(address.city || '');
    setFormIsDefault(!!address.isDefault);
    setFormType(address.name && address.name.includes('Văn') ? 'Văn Phòng' : 'Nhà Riêng');
    // Tìm lại tỉnh/huyện/xã từ city nếu có
    const province = VIETNAM_PROVINCES.find(p => address.city && address.city.includes(p.name));
    setSelectedProvince(province || null);
    if (province) {
      const district = province.districts.find(d => address.city && address.city.includes(d.name));
      setSelectedDistrict(district || null);
      if (district) {
        const commune = district.communes.find(c => address.city && address.city.includes(c.name));
        setSelectedCommune(commune || null);
      } else setSelectedCommune(null);
    } else {
      setSelectedDistrict(null);
      setSelectedCommune(null);
    }
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleSaveNewAddress = () => {
    // Gộp thông tin tỉnh/huyện/xã vào city
    let city = '';
    if (selectedProvince) city += selectedProvince.name;
    if (selectedDistrict) city += ', ' + selectedDistrict.name;
    if (selectedCommune) city += ', ' + selectedCommune.name;
    if (!city) city = formCity;
const addressId = editingId ?? Date.now().toString();

const newAddr: Address = {
  id: addressId,
  name: formName || (formType === 'Văn Phòng' ? 'Văn Phòng' : 'Nhà Riêng'),
  street: formStreet || 'Địa chỉ',
  city,
  state: '',
  zip: '',
  phone: formPhone || '',
  isDefault: formIsDefault,
};
    onAddAddress?.(newAddr);
    onSelectAddress(newAddr);
    setSelectedAddress(newAddr);
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleDeleteAddress = () => {
    if (!editingId) {
      console.log('No editingId found');
      return;
    }
    console.log('Delete address with ID:', editingId);
    Alert.alert(
      'Xóa địa chỉ',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmed delete, calling onRemoveAddress');
            const addressToDelete = editingId;
            onRemoveAddress?.(addressToDelete);
            setShowAddModal(false);
            setEditingId(null);
          },
        },
      ]
    );
  };

  const handleMapPickForForm = async () => {
    try {
      // @ts-ignore
      const Location: any = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Quyền vị trí bị từ chối.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      setFormStreet(`Lat: ${latitude.toFixed(4)}`);
      setFormCity(`Lon: ${longitude.toFixed(4)}`);
      setFormName('Địa chỉ hiện tại');
    } catch (e) {
      setFormStreet('Vị trí hiện tại');
      setFormCity('Gần đây');
      setFormName('Địa chỉ hiện tại');
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleSaveAddress = () => {
    if (selectedAddress) {
      onSelectAddress(selectedAddress);
    }
  };

  const handleAddCurrentLocation = async () => {
    try {
      // dynamic import - may not be installed in every workspace; ignore TS module error
      // @ts-ignore
      const Location: any = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Quyền vị trí bị từ chối. Vui lòng bật quyền vị trí và thử lại.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      const newAddr: Address = {
        id: Date.now().toString(),
        name: 'Địa chỉ hiện tại',
        street: `Lat: ${latitude.toFixed(4)}`,
        city: `Lon: ${longitude.toFixed(4)}`,
        state: '',
        zip: '',
        phone: '',
        isDefault: false,
      };
      setSelectedAddress(newAddr);
      onAddAddress?.(newAddr);
      onSelectAddress(newAddr);
    } catch (e) {
      // fallback when expo-location isn't available or fails
      const newAddr: Address = {
        id: Date.now().toString(),
        name: 'Địa chỉ hiện tại',
        street: 'Vị trí hiện tại',
        city: 'Gần đây',
        state: '',
        zip: '',
        phone: '',
        isDefault: false,
      };
      setSelectedAddress(newAddr);
      onAddAddress?.(newAddr);
      onSelectAddress(newAddr);
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
            keyExtractor={(item, index) => `${item.id}-${index}`}
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={{ padding: 6, marginRight: 8 }}>
                    <Ionicons name="create" size={18} color="#666" />
                  </TouchableOpacity>
                  {selectedAddress?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#e91e63" />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />

          {/* CHOOSE ANOTHER OPTION */}
          <TouchableOpacity
            onPress={openAddModal}
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
<TouchableOpacity onPress={onBack}>
  <Ionicons name="arrow-back" size={24} />
</TouchableOpacity>

        {/* CHOOSE LOCATION SECTION */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Choose location</Text>

          {/* MAP PLACEHOLDER */}
          <TouchableOpacity style={styles.mapContainer} onPress={() => (showAddModal ? handleMapPickForForm() : handleAddCurrentLocation())} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/map.jpg")}
            style={styles.mapImage}
              onError={() => console.log("❌ map.jpg not found")}            />
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={40} color="#e91e63" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapSelectButton} onPress={() => (showAddModal ? handleMapPickForForm() : handleAddCurrentLocation())}>
            <Text style={styles.mapSelectText}>Chọn vị trí này</Text>
          </TouchableOpacity>

          {/* Add/Edit Address Modal - opens when tapping 'Choose another' */}
          <Modal visible={showAddModal} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeAddModal} style={{ padding: 8 }}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{editingId ? 'Sửa địa chỉ' : 'Địa chỉ mới'}</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={{ padding: 16 }}>
                <Text style={styles.inputLabel}>Họ và tên</Text>
                <TextInput value={formName} onChangeText={setFormName} style={styles.input} placeholder="Họ và tên" />

                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput value={formPhone} onChangeText={setFormPhone} style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" />


                <Text style={styles.inputLabel}>Tỉnh/Thành phố</Text>
                <View style={[styles.input, { padding: 0 }]}> 
                  <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 200 }}>
                    {VIETNAM_PROVINCES.map((p) => (
                      <TouchableOpacity key={p.id} onPress={() => { setSelectedProvince(p); setSelectedDistrict(null); setSelectedCommune(null); }} style={{ padding: 8, backgroundColor: selectedProvince?.id === p.id ? '#e91e63' : '#fff', borderRadius: 8, marginBottom: 8 }}>
                        <Text style={{ color: selectedProvince?.id === p.id ? '#fff' : '#333' }}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {selectedProvince && (
                  <>
                    <Text style={styles.inputLabel}>Quận/Huyện</Text>
                    <View style={[styles.input, { padding: 0 }]}> 
                      <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 200 }}>
                        {selectedProvince.districts.map((d) => (
                          <TouchableOpacity key={d.id} onPress={() => { setSelectedDistrict(d); setSelectedCommune(null); }} style={{ padding: 8, backgroundColor: selectedDistrict?.id === d.id ? '#e91e63' : '#fff', borderRadius: 8, marginBottom: 8 }}>
                            <Text style={{ color: selectedDistrict?.id === d.id ? '#fff' : '#333' }}>{d.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </>
                )}

                {selectedDistrict && (
                  <>
                    <Text style={styles.inputLabel}>Phường/Xã</Text>
                    <View style={[styles.input, { padding: 0 }]}> 
                      <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 200 }}>
                        {selectedDistrict.communes.map((c) => (
                          <TouchableOpacity key={c.id} onPress={() => setSelectedCommune(c)} style={{ padding: 8, backgroundColor: selectedCommune?.id === c.id ? '#e91e63' : '#fff', borderRadius: 8, marginBottom: 8 }}>
                            <Text style={{ color: selectedCommune?.id === c.id ? '#fff' : '#333' }}>{c.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </>
                )}

                <Text style={styles.inputLabel}>Tên đường, Tòa nhà, Số nhà</Text>
                <TextInput value={formStreet} onChangeText={setFormStreet} style={styles.input} placeholder="Địa chỉ" />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <Text>Đặt làm địa chỉ mặc định</Text>
                  <Switch value={formIsDefault} onValueChange={setFormIsDefault} />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Loại địa chỉ</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setFormType('Văn Phòng')} style={[styles.typeButton, formType === 'Văn Phòng' && styles.typeButtonActive]}>
                    <Text style={formType === 'Văn Phòng' ? styles.typeTextActive : styles.typeText}>Văn Phòng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFormType('Nhà Riêng')} style={[styles.typeButton, formType === 'Nhà Riêng' && styles.typeButtonActive]}>
                    <Text style={formType === 'Nhà Riêng' ? styles.typeTextActive : styles.typeText}>Nhà Riêng</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formButtons}>
                  {editingId ? (
                    <TouchableOpacity onPress={handleDeleteAddress} style={styles.deleteButton}>
                      <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>Xóa địa chỉ này</Text>
                    </TouchableOpacity>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={closeAddModal} style={[styles.cancelButton, { flex: 1 }]}>
                      <Text style={{ textAlign: 'center' }}>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveNewAddress} style={[styles.saveButtonPrimary, { flex: 1 }]}>
                      <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>Hoàn thành</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

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
    paddingTop: 22,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
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
  mapSelectButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#ffe4ed',
  },
  mapSelectText: {
    color: '#e91e63',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  modalTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600',    paddingVertical: 30,
 },
  inputLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#e91e63',
    backgroundColor: '#fdeff5',
  },
  typeText: { color: '#333' },
  typeTextActive: { color: '#e91e63', fontWeight: '600' },
  formButtons: { marginTop: 20 },
  cancelButton: { padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  saveButtonPrimary: { padding: 12, backgroundColor: '#e91e63', borderRadius: 8 },
  deleteButton: { padding: 12, backgroundColor: '#ef4444', borderRadius: 8, marginBottom: 12 },
});
