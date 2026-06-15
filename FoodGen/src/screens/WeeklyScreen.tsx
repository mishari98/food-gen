import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlan } from '../context/MealPlanContext';
import { getSlotsForMealsPerDay, getSlotEmoji, MealSlotName } from '../utils/constants';
import { getDayName, getDayNumber, getWeekNumber, formatWeekRange, getDaysOfWeek } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from './MealDetailModal';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import { Meal } from '../types/meal';
import { saveWeekPlan } from '../database/planRepository';

export default function WeeklyScreen({ navigation }: any) {
  const { weekPlans, mealsPerDay, showLabels, isLoading, generateWeek, regenerateDay, setMealsPerDay, setShowLabels } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const today = new Date();
  const weekNumber = getWeekNumber(today);
  const weekRangeStr = formatWeekRange(today);
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);
  const daysOfWeek = getDaysOfWeek(today);

  const handleGenerateWeek = () => {
    Alert.alert(
      'Generate New Week',
      'This will replace your current meal plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => generateWeek() },
      ]
    );
  };

  const handleRegenerateDay = (dateStr: string) => {
    Alert.alert(
      'Regenerate Day',
      'Replace meals for this day?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', onPress: () => regenerateDay(dateStr) },
      ]
    );
  };

  const getMealForSlot = (slot: MealSlotName, date: string): Meal | undefined => {
    const dayPlan = weekPlans.find(w => w.date === date);
    if (!dayPlan) return undefined;
    switch (slot) {
      case 'breakfast': return dayPlan.breakfast;
      case 'lunch': return dayPlan.lunch;
      case 'dinner': return dayPlan.dinner;
      case 'snack': return dayPlan.snack;
    }
  };

  const formatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>📆 Week {weekNumber}</Text>
          <Text style={styles.weekRange}>{weekRangeStr}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddMeal')}
          style={styles.headerButton}
        >
          <Ionicons name="add-circle-outline" size={26} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Meals Per Day Picker */}
      <MealsPerDayPicker
        value={mealsPerDay}
        onChange={setMealsPerDay}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading your week...</Text>
        ) : weekPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📆</Text>
            <Text style={styles.emptyText}>No meal plan for this week</Text>
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateWeek}>
              <Text style={styles.generateButtonText}>🔄 Generate Week</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Day Cards */}
            {daysOfWeek.map((day) => {
              const dateStr = formatDateStr(day);
              const isExpanded = expandedDay === dateStr;
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[styles.dayCard, isExpanded && styles.dayCardExpanded]}
                  onPress={() => setExpandedDay(isExpanded ? null : dateStr)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{getDayName(day)}</Text>
                    <Text style={styles.dayNumber}>{getDayNumber(day)}</Text>
                    <TouchableOpacity
                      style={styles.regenDayBtn}
                      onPress={() => handleRegenerateDay(dateStr)}
                    >
                      <Text style={styles.regenDayText}>↻</Text>
                    </TouchableOpacity>
                  </View>

                  {isExpanded && (
                    <View style={styles.dayMeals}>
                      {activeSlots.map((slot) => {
                        const meal = getMealForSlot(slot, dateStr);
                        return (
                          <TouchableOpacity
                            key={slot}
                            onPress={() => meal && setSelectedMeal(meal)}
                            activeOpacity={0.7}
                          >
                            <MealCard
                              meal={meal}
                              slotEmoji={getSlotEmoji(slot)}
                              slotName={slot}
                              showLabel={showLabels}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.generateWeekBtn} onPress={handleGenerateWeek}>
                <Text style={styles.generateWeekText}>🔄 Generate New Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  const weekNum = getWeekNumber(today);
                  const year = today.getFullYear();
                  saveWeekPlan(null, weekNum, year).then(() => {
                    Alert.alert('✅ Saved', 'Your meal plan has been saved! You can load it anytime.');
                  }).catch(() => {
                    Alert.alert('Error', 'Failed to save meal plan.');
                  });
                }}
              >
                <Text style={styles.saveBtnText}>💾 Save This Plan</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />
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
    marginBottom: 4,
  },
  headerButton: {
    padding: 8,
    width: 44,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  weekRange: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardExpanded: {
    paddingBottom: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    width: 40,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginRight: 'auto',
  },
  regenDayBtn: {
    padding: 4,
    paddingHorizontal: 10,
  },
  regenDayText: {
    fontSize: 20,
    color: '#999',
  },
  dayMeals: {
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  generateWeekBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateWeekText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2EC4B6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});