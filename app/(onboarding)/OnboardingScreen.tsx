import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Hoa Tươi Mỗi Ngày",
    subtitle: "Hoa tươi, đẹp cho mọi dịp đặc biệt",
    image: require("../../assets/images/anhhoa1.jpg"),
  },
  {
    id: "2",
    title: "Duyệt Bộ Sưu Tập",
    subtitle: "Khám phá đa dạng các loài hoa tuyệt đẹp",
    image: require("../../assets/images/anhhoa2.jpg"),
  },
  {
    id: "3",
    title: "Sẵn Sàng Chưa?",
    subtitle: "Tìm kiếm hoa bạn cần ngay bây giờ",
    image: require("../../assets/images/anhhoa3.jpg"),
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
useEffect(() => {
  Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  return () => {
    stopMusic();
  };
}, []);

  /* =======================
     PLAY MUSIC (USER ACTION)
  ======================= */
  const playMusic = async () => {
    if (musicStarted) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/music/man.mp3"),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.6,
        }
      );
      soundRef.current = sound;
      setMusicStarted(true);
    } catch (e) {
      console.log("❌ Không phát được nhạc:", e);
    }
  };

  const stopMusic = async () => {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
  };

  const handleNext = async () => {
    await playMusic(); // ✅ user bấm → được phép phát

    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    await completeOnboarding();
    await stopMusic();
    router.replace("/(auth)/Login");
  };

  const handleSkip = async () => {
    await playMusic(); // vẫn đảm bảo user interaction
    await completeOnboarding();
    await stopMusic();
    router.replace("/(auth)/Login");
  };

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.slideContent}>
        <Image source={currentSlide.image} style={styles.image} />
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
      </View>

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Bỏ Qua</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Bắt Đầu" : "Tiếp Tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f6",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    marginBottom: 30,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#f472b6",
    width: 24,
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 40,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f472b6",
  },
  skipText: {
    color: "#f472b6",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  nextButton: {
    paddingVertical: 14,
    backgroundColor: "#f472b6",
    borderRadius: 12,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
