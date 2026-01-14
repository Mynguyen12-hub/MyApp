import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ 
  value, 
  onChange, 
  length = 6, 
  disabled = false,
  error = false 
}: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleInput = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // Only digits
    
    const otpArray = value.split('');
    otpArray[index] = text;
    const newOtp = otpArray.join('');
    onChange(newOtp);

    // Auto move to next field
    if (text && index < length - 1) {
      inputRefs.current?.[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current?.[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <View key={index} style={styles.boxWrapper}>
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={value[index] || ''}
              onChangeText={(text) => handleInput(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              editable={!disabled}
              style={[
                styles.box,
                value[index] && styles.boxFilled,
                error && styles.boxError,
              ]}
              placeholder="-"
              placeholderTextColor="#d1d5db"
            />
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  boxWrapper: {
    flex: 1,
    maxWidth: 50,
  },
  box: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  boxFilled: {
    borderColor: '#e91e63',
    backgroundColor: '#fff0f6',
  },
  boxError: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
});
