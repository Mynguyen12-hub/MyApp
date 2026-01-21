// ChatScreen.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";

import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
interface Product {
  id: string | number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  products?: Product[];
}

interface ChatScreenProps {
  onAddToCart?: (product: Product, quantity?: number) => void;
}

export default function ChatScreen({ onAddToCart }: ChatScreenProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [navigationDisabled, setNavigationDisabled] = useState(false);

  useEffect(() => {
    if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // 🔧 THAY ĐỔI IP NÀY THÀNH IP CỦA MÁY TÍNH CỦA BẠN
      
      const endpoints = [
        "http://localhost:3000/chat",
        `http://92.168.1.50:3000/chat`,
        "http://10.0.2.2:3000/chat",
        "http://192.168.1.89:3000/chat",
      ];

      let success = false;
      let responseData;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`📤 Testing endpoint: ${endpoint}`);
          console.log(`📨 Sending message: ${userMessage.text}`);
          
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage.text }),
          });

          console.log(`📊 Response status: ${res.status}`);
          
          responseData = await res.json();
          console.log(`📦 Response data:`, JSON.stringify(responseData, null, 2));

          if (res.ok) {
            console.log(`✅ Success! Got reply: ${responseData.reply}`);
            success = true;
            break;
          } else {
            console.log(`⚠️ Server returned error:`, responseData);
            lastError = responseData;
          }
        } catch (e: any) {
          console.log(`❌ Endpoint failed: ${endpoint}`);
          console.log(`🔴 Error message:`, e.message);
          console.log(`🔴 Full error:`, JSON.stringify(e, null, 2));
          lastError = e;
          continue;
        }
      }

      if (!success) {
        let errorMessage = "❌ Không kết nối được server.";
        console.log(`💥 All endpoints failed. Last error:`, lastError);

        if (lastError?.solution) {
          errorMessage = `⚠️ ${lastError.message}\n\n💡 ${lastError.solution}`;
        } else if (lastError?.message) {
          errorMessage = `❌ ${lastError.message}`;
        } else if (lastError?.error) {
          errorMessage = `❌ ${lastError.error}`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: errorMessage,
            sender: "bot",
          },
        ]);
        setIsTyping(false);
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.reply || "Tôi không hiểu yêu cầu của bạn",
        sender: "bot",
        products: responseData.products || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e: any) {
      console.error("💥 Unexpected error in sendMessage:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "❌ Lỗi không mong muốn. Vui lòng kiểm tra backend server.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
        <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
          <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
          {!isUser && item.products && item.products.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {item.products.map((p, index) => {
                return (
                  <TouchableOpacity
                    key={p.id?.toString() || index}
                    style={styles.productCard}
                    onPress={() => {
                      console.log("Product tapped (chat):", p);
                      try {
                        if (onAddToCart) {
                          onAddToCart(p, 1);
                          console.log('Added to cart from chat:', p.name || p.id);
                        } else {
                          console.log('onAddToCart not provided to ChatScreen');
                        }
                      } catch (e) {
                        console.warn('Failed to add product to cart from chat', e);
                      }
                    }}
                  >
                    {p.image_url && (
                      <Image
                        source={{ uri: p.image_url }}
                        style={styles.productImage}
                        onError={(e) => console.log("Image error:", e.nativeEvent.error)}
                      />
                    )}
                    <Text style={styles.productName} numberOfLines={2}>
                      {p.name || "Sản phẩm"}
                    </Text>
                    <Text style={styles.productPrice}>
                      {p.price ? p.price.toLocaleString("vi-VN") : "Liên hệ"} VNĐ
                    </Text>
                    {p.description && (
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {p.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

return (
  <>
    {/* Ẩn header mặc định của navigator */}
    <Stack.Screen options={{ headerShown: false }} />

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER HỒNG CỦA BẠN */}
 {/* HEADER HỒNG CỦA BẠN */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat tư vấn</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5"},
  messageWrapper: { marginVertical: 24 },
  userWrapper: { alignSelf: "flex-end", marginRight: 10 },
  botWrapper: { alignSelf: "flex-start", marginLeft: 10 },
  messageContainer: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  userMessage: { backgroundColor: "#FF69B4" },
  botMessage: { backgroundColor: "#f0f0f0" },
  userText: { color: "#fff", fontSize: 14 },
  botText: { color: "#000", fontSize: 14 },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#FF69B4",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FF69B4",
    alignItems: "center",
    width: "100%",
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  productName: {
    color: "#FF69B4",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  productPrice: { color: "#FF1493", fontWeight: "600", fontSize: 12, marginBottom: 4 },
  productDescription: { color: "#666", fontSize: 11, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    // Không paddingTop, không paddingBottom để icon và text cùng giữa
  },

headerTitle: {
  marginLeft: 12,
  fontSize: 18,
  fontWeight: "bold",
  color: "#FF69B4",
  textAlignVertical: "center",
},

});