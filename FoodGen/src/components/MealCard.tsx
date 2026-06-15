import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Meal } from '../types/meal';
import { MealSlotName } from '../utils/constants';

interface MealCardProps {
  meal: Meal | undefined;
  slotEmoji: string;
  slotName: MealSlotName;
  showLabel: boolean;
}

export default function MealCard({ meal, slotEmoji, slotName, showLabel }: MealCardProps) {
  if (!meal) {
    return (
      <View style={styles.card}>
        <View style={styles.mealInfo}>
          <Text style={styles.emoji}>{slotEmoji}</Text>
          <View style={styles.textInfo}>
            {showLabel && <Text style={styles.slotLabel}>{slotName.toUpperCase()}</Text>}
            <Text style={styles.mealName}>No meal assigned</Text>
          </View>
        </View>
      </View>
    );
  }

  const difficultyColors: Record<string, string> = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };

  return (
    <View style={styles.card}>
      <View style={styles.mealInfo}>
        <Text style={styles.emoji}>{meal.emoji}</Text>
        <View style={styles.textInfo}>
          {showLabel && <Text style={styles.slotLabel}>{slotName.toUpperCase()}</Text>}
          <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱ {meal.prepTimeMinutes} min</Text>
            <Text style={[styles.metaText, { color: difficultyColors[meal.difficulty] || '#999' }]}>
              🔥 {meal.difficulty}
            </Text>
            {meal.isCustom === 1 && <Text style={styles.customBadge}>👤 You</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginRight: 14,
  },
  textInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#888',
  },
  customBadge: {
    fontSize: 12,
    color: '#7C4DFF',
    fontWeight: '500',
  },
});