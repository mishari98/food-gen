import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MealsPerDayPickerProps {
  value: number;
  onChange: (value: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

const OPTIONS = [
  { value: 1, label: '1 🍽️' },
  { value: 2, label: '2 🍽️🍽️' },
  { value: 3, label: '3 🍽️🍽️🍽️' },
];

export default function MealsPerDayPicker({ value, onChange, showLabels, onToggleLabels }: MealsPerDayPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, value === opt.value && styles.optionActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.optionText, value === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.toggleBtn} onPress={onToggleLabels}>
        <Text style={styles.toggleText}>{showLabels ? '🏷️ ON' : '🏷️ OFF'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  pickerRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});