import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { createOrder } from "../services/orderService";

export default function MomoPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const items = params.items
    ? JSON.parse(params.items as string)
    : [];

  const totalAmount = params.totalAmount
    ? Number(params.totalAmount)
    : 0;

  const handleMomoPay = async () => {
    const momoUrl =
      "momo://?action=payWithApp&amount=" +
      totalAmount +
      "&description=Thanh%20toan%20don%20hang";

    try {
      await Linking.openURL(momoUrl);
    } catch (e) {
      Alert.alert("Lỗi", "Không mở được MoMo");
      return;
    }

    // 👉 GIẢ LẬP thanh toán thành công
    await createOrder({
      paymentMethod: "momo",
      totalAmount,
      items,
    });

    Alert.alert("Thành công", "Thanh toán MoMo thành công");
    router.replace("/order-success");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        Thanh toán MoMo
      </Text>

      <TouchableOpacity
        onPress={handleMomoPay}
        style={{
          backgroundColor: "#a50064",
          padding: 16,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Thanh toán MoMo
        </Text>
      </TouchableOpacity>
    </View>
  );
}
