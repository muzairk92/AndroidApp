import React, {useState} from 'react';
import {View, TextInput, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PasswordInput = ({label, value, onChangeText, error, placeholder}) => {
  const [secure, setSecure] = useState(true);
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholder={placeholder}
          style={styles.input}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setSecure(prev => !prev)}>
          <Icon name={secure ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#4b5563',
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  error: {
    color: '#dc2626',
    marginTop: 4,
  },
});

export default PasswordInput;
