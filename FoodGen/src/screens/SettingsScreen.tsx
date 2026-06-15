import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlan } from '../context/MealPlanContext';
import MealsPerDayPicker from '../components/MealsPerDayPicker';

export default function SettingsScreen({ navigation }: any) {
  const { mealsPerDay, showLabels, setMealsPerDay, setShowLabels } = useMealPlan();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Meals Per Day Section */}
        <Text style={styles.sectionTitle}>Meals Per Day</Text>
        <Text style={styles.sectionDesc}>How many meals do you cook per day?</Text>
        <MealsPerDayPicker
          value={mealsPerDay}
          onChange={setMealsPerDay}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            With 1 meal: Dinner only
          </Text>
          <Text style={styles.infoText}>
            With 2 meals: Lunch + Dinner
          </Text>
          <Text style={styles.infoText}>
            With 3 meals: Breakfast + Lunch + Dinner
          </Text>
        </View>

        {/* Display Options Section */}
        <Text style={styles.sectionTitle}>Display Options</Text>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Show meal slot labels</Text>
            <Text style={styles.optionDesc}>🌙 Dinner, ☀️ Lunch titles</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, showLabels ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setShowLabels(!showLabels)}
          >
            <Text style={[styles.toggleText, showLabels ? styles.toggleTextOn : styles.toggleTextOff]}>
              {showLabels ? '🟢 ON' : '🔴 OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.optionHint}>
          When OFF: cards show just meal name without the slot label
        </Text>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>Made with ❤️ for Filipino food 🇵🇭</Text>
          <Text style={styles.aboutText}>Data: 77 Filipino dishes</Text>
          <Text style={styles.aboutText}>Framework: React Native + Expo</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBtn: { padding: 8, width: 44, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  optionDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleOn: { backgroundColor: '#E8F5E9' },
  toggleOff: { backgroundColor: '#FFEBEE' },
  toggleText: { fontSize: 14, fontWeight: '600' },
  toggleTextOn: { color: '#2E7D32' },
  toggleTextOff: { color: '#C62828' },
  optionHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  aboutBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});