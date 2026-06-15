import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlan } from '../context/MealPlanContext';
import { getSlotsForMealsPerDay, getSlotEmoji, MealSlotName } from '../utils/constants';
import { formatDisplayDate } from '../utils/dateHelpers';
import MealCard from '../components/MealCard';
import MealDetailModal from './MealDetailModal';
import MealsPerDayPicker from '../components/MealsPerDayPicker';
import { Meal } from '../types/meal';

export default function TodayScreen({ navigation }: any) {
  const { todayPlan, mealsPerDay, showLabels, isLoading, refreshToday, setMealsPerDay, setShowLabels } = useMealPlan();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const activeSlots = getSlotsForMealsPerDay(mealsPerDay);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshToday();
    setRefreshing(false);
  };

  const getMealForSlot = (slot: MealSlotName): Meal | undefined => {
    if (!todayPlan) return undefined;
    switch (slot) {
      case 'breakfast': return todayPlan.breakfast;
      case 'lunch': return todayPlan.lunch;
      case 'dinner': return todayPlan.dinner;
      case 'snack': return todayPlan.snack;
    }
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
          <Text style={styles.title}>🍽️ FoodGen</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddMeal')}
          style={styles.headerButton}
        >
          <Ionicons name="add-circle-outline" size={26} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Date */}
      <Text style={styles.dateText}>{formatDisplayDate(today.toISOString().split('T')[0])}</Text>

      {/* Meals Per Day Picker */}
      <MealsPerDayPicker
        value={mealsPerDay}
        onChange={setMealsPerDay}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />

      {/* Meal Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
        }
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Loading your meals...</Text>
        ) : !todayPlan ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No meals generated yet</Text>
            <TouchableOpacity style={styles.generateButton} onPress={onRefresh}>
              <Text style={styles.generateButtonText}>Generate Today's Meals</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeSlots.map((slot) => {
            const meal = getMealForSlot(slot);
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
          })
        )}

        {/* Regenerate hint */}
        {todayPlan && (
          <Text style={styles.hintText}>↓ Pull down to regenerate today's meals</Text>
        )}
      </ScrollView>

      {/* Meal Detail Modal */}
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
  dateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
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
  hintText: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 12,
    marginTop: 20,
  },
});