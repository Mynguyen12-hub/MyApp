import React from "react";
import { View, StyleSheet } from "react-native";
import { PaymentMethodsScreen, PaymentMethod } from "@/components/PaymentMethods";
import { useRouter } from "expo-router";

export default function PaymentScreen() {
  const router = useRouter();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "card",
      name: "Visa Mastercard",
      provider: "Ngân hàng Vietcombank",
      last4: "1234",
      expiryDate: "12/25",
      cardBrand: "💳",
      isDefault: true,
      isFavorite: true,
      status: "active",
    },
    {
      id: "2",
      type: "momo",
      name: "Ví MoMo",
      provider: "MoMo Vietnam",
      isDefault: false,
      isFavorite: true,
      status: "active",
    },
    {
      id: "3",
      type: "bank",
      name: "Chuyển khoản ngân hàng",
      provider: "TPBank",
      bank: "TPBank - Kỹ Thuật Công Nghệ",
      isDefault: false,
      isFavorite: false,
      status: "active",
    },
    {
      id: "4",
      type: "card",
      name: "AMEX",
      provider: "Ngân hàng ACB",
      last4: "5678",
      expiryDate: "08/24",
      cardBrand: "💳",
      isDefault: false,
      isFavorite: false,
      status: "expiring",
    },
    {
      id: "5",
      type: "cod",
      name: "Thanh toán khi nhận hàng",
      provider: "COD",
      isDefault: false,
      isFavorite: false,
      status: "active",
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    console.log("Selected payment method:", method);
    router.back();
  };

  return (
    <View style={styles.container}>
      <PaymentMethodsScreen
        methods={paymentMethods}
        onBack={handleBack}
        onSelectMethod={handleSelectMethod}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
