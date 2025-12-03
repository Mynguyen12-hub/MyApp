import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Scroll xuống dưới khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Gửi tin nhắn và gọi API
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      // Gọi API giả lập, bạn thay bằng API thực tế
      const response = await fetch("https://api.example.com/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Bot không trả lời được.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Nếu API lỗi, vẫn trả lời giả lập
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Có lỗi khi gọi API. Đây là phản hồi giả lập.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.userWrapper : styles.botWrapper,
        ]}
      >
        {!isUser && (
          <Image
            source={{ uri: "https://i.pravatar.cc/300?img=3" }}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.botMessage,
          ]}
        >
          <Text style={isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
        </View>
        {isUser && (
          <Image
            source={{ uri: "https://i.pravatar.cc/300?img=5" }}
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Chatbox */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  messageWrapper: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  userWrapper: { justifyContent: "flex-end" },
  botWrapper: { justifyContent: "flex-start" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 4 },
  messageContainer: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: "#FF69B4",
    borderTopRightRadius: 0,
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 0,
    alignSelf: "flex-start",
  },
  userText: { color: "#fff", fontSize: 16 },
  botText: { color: "#000", fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#FF69B4",
    borderRadius: 20,
    padding: 10,
  },
});
