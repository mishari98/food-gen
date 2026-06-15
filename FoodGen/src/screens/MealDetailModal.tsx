import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Image } from 'react-native';
import { Meal } from '../types/meal';

interface MealDetailModalProps {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
}

export default function MealDetailModal({ visible, meal, onClose }: MealDetailModalProps) {
  if (!meal) return null;

  const suggestedFor: string[] = JSON.parse(meal.suggestedFor || '[]');
  const ingredients: { name: string; quantity: string }[] = JSON.parse(meal.ingredients || '[]');
  const steps: string[] = JSON.parse(meal.steps || '[]');
  const dietaryTags: string[] = JSON.parse(meal.dietaryTags || '[]');

  const difficultyColors: Record<string, string> = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>{meal.emoji}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
            {meal.isCustom === 1 && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>👤 You</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Suggested For */}
            <View style={styles.slotsRow}>
              {suggestedFor.map((slot: string) => {
                const emojis: Record<string, string> = {
                  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿',
                };
                return (
                  <View key={slot} style={styles.slotTag}>
                    <Text style={styles.slotTagText}>{emojis[slot] || '🍽️'} {slot}</Text>
                  </View>
                );
              })}
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>⏱ {meal.prepTimeMinutes} min</Text>
              <Text style={[styles.metaText, { color: difficultyColors[meal.difficulty] }]}>
                🔥 {meal.difficulty}
              </Text>
              {meal.calories && (
                <Text style={styles.metaText}>🔥 ~{meal.calories} cal</Text>
              )}
            </View>

            {/* Photo */}
            {meal.photoPath && (
              <Image source={{ uri: meal.photoPath }} style={styles.photo} />
            )}

            {/* Dietary Tags */}
            {dietaryTags.length > 0 && (
              <View style={styles.tagsRow}>
                {dietaryTags.map((tag: string) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>🌿 {tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* YouTube Link */}
            {meal.youtubeLink && (
              <TouchableOpacity
                style={styles.youtubeBtn}
                onPress={() => Linking.openURL(meal.youtubeLink!)}
              >
                <Text style={styles.youtubeBtnText}>▶️ Watch Recipe on YouTube</Text>
              </TouchableOpacity>
            )}

            {/* Ingredients */}
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ingredientText}>{ing.name} — {ing.quantity}</Text>
              </View>
            ))}

            {/* Steps */}
            <Text style={styles.sectionTitle}>Steps</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  customBadge: {
    backgroundColor: '#F3E5FF',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  customBadgeText: {
    fontSize: 13,
    color: '#7C4DFF',
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  slotTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotTagText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  youtubeBtn: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  youtubeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 8,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 16,
    color: '#FF6B35',
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
    lineHeight: 22,
  },
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});