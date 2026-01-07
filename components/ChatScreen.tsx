import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface ChatScreenProps {
  onBack: () => void;
}

export default function ChatScreen({ onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
  console.log("📨 Sending message:", userMessage.text); // DEBUG

  try {
    const res = await fetch("http://10.0.2.2:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.text }),
    });

    console.log("✅ Response status:", res.status); // DEBUG
    const data = await res.json();
    console.log("📦 Response data:", data); // DEBUG

    if (data.reply) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  } catch (error) {
    console.error("❌ Error:", error); // DEBUG
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: "❌ Không kết nối được AI",
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
      style={[styles.container, { paddingBottom: keyboardHeight }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FF69B4" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image
            source={{
              uri: "https://img.icons8.com/emoji/48/000000/hibiscus-emoji.png",
            }}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>SFlower Phálett Xin Chào</Text>
        </View>
      </View>

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/300?img=3" }}
                style={styles.avatar}
              />
              <Text style={styles.typingText}>Bot đang gõ...</Text>
            </View>
          ) : null
        }
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    top: 30,
  },
  backButton: { marginRight: 12 },
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 28, height: 28, marginRight: 8 },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#FF69B4" },
  messageWrapper: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  userWrapper: { justifyContent: "flex-end" ,top:30},
  botWrapper: { justifyContent: "flex-start" ,top:35},
  avatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 4 },
  messageContainer: { maxWidth: "70%", padding: 10, borderRadius: 12 },
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
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    marginLeft: 4,
  },
  typingText: { fontStyle: "italic", color: "#555", marginLeft: 8 },
});
