import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Image, Platform, Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { insertMeal } from '../database/mealRepository';

const MEAL_SLOTS = [
  { key: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { key: 'lunch', emoji: '☀️', label: 'Lunch' },
  { key: 'dinner', emoji: '🌙', label: 'Dinner' },
  { key: 'snack', emoji: '🍿', label: 'Snack' },
];

const CUISINES = ['Filipino', 'Italian', 'Asian', 'Mexican', 'Indian', 'American', 'Other'];
const DIFFICULTIES: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

export default function AddMealScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [suggestedFor, setSuggestedFor] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState('Filipino');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [emoji, setEmoji] = useState('🍽️');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>([
    { name: '', quantity: '' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [calories, setCalories] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSlot = (slot: string) => {
    setSuggestedFor(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', quantity: '' }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) setIngredients(prev => prev.filter((_, i) => i !== index));
  };
  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    setIngredients(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = (index: number) => {
    if (steps.length > 1) setSteps(prev => prev.filter((_, i) => i !== index));
  };
  const updateStep = (index: number, value: string) => {
    setSteps(prev => prev.map((step, i) => i === index ? value : step));
  };

  const pickImage = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (perm.granted) {
            const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
            if (!result.canceled && result.assets[0]) {
              setPhotoPath(result.assets[0].uri);
            }
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (perm.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
            if (!result.canceled && result.assets[0]) {
              setPhotoPath(result.assets[0].uri);
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = (): boolean => {
    if (!name.trim()) { Alert.alert('Validation', 'Please enter a meal name.'); return false; }
    if (suggestedFor.length === 0) { Alert.alert('Validation', 'Select at least one meal slot.'); return false; }
    if (!prepTime || parseInt(prepTime) <= 0) { Alert.alert('Validation', 'Enter a valid prep time.'); return false; }
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) { Alert.alert('Validation', 'Add at least one ingredient.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const validIngredients = ingredients.filter(i => i.name.trim());
      const validSteps = steps.filter(s => s.trim());
      await insertMeal({
        name: name.trim(),
        suggestedFor: JSON.stringify(suggestedFor),
        cuisine,
        dietaryTags: '[]',
        prepTimeMinutes: parseInt(prepTime),
        difficulty,
        emoji,
        photoPath: photoPath ?? null,
        youtubeLink: youtubeLink.trim() || null,
        ingredients: JSON.stringify(validIngredients),
        steps: JSON.stringify(validSteps.length > 0 ? validSteps : ['No steps provided']),
        calories: calories ? parseInt(calories) : null,
      });
      Alert.alert('Success', `🍽️ ${name.trim()} added to your meals!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // This is only shown for custom meals that already exist,
    // not during initial creation flow
    Alert.alert('Delete', 'This meal has not been saved yet. Cancel to go back.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>➕ Add Meal</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerBtn, styles.saveBtn]}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? '...' : '💾'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Meal Name */}
        <Text style={styles.label}>Meal Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Pork Sisig" />

        {/* Suggested For */}
        <Text style={styles.label}>Suggested For *</Text>
        <View style={styles.slotsRow}>
          {MEAL_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot.key}
              style={[styles.slotChip, suggestedFor.includes(slot.key) && styles.slotChipActive]}
              onPress={() => toggleSlot(slot.key)}
            >
              <Text style={[styles.slotChipText, suggestedFor.includes(slot.key) && styles.slotChipTextActive]}>
                {slot.emoji} {slot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cuisine */}
        <Text style={styles.label}>Cuisine</Text>
        <View style={styles.cuisineRow}>
          {CUISINES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.cuisineChip, cuisine === c && styles.cuisineChipActive]}
              onPress={() => setCuisine(c)}
            >
              <Text style={[styles.cuisineChipText, cuisine === c && styles.cuisineChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prep Time & Difficulty Row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prep Time (min) *</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
              placeholder="30"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffChip, difficulty === d && styles.diffChipActive]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.diffChipText, difficulty === d && styles.diffChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Emoji */}
        <Text style={styles.label}>Emoji</Text>
        <TextInput
          style={styles.input}
          value={emoji}
          onChangeText={setEmoji}
          placeholder="🍽️"
          maxLength={2}
        />

        {/* Photo */}
        <Text style={styles.label}>Photo (optional)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Ionicons name="camera-outline" size={20} color="#666" />
          <Text style={styles.photoBtnText}>
            {photoPath ? 'Photo selected ✓' : 'Take Photo or Choose from Gallery'}
          </Text>
        </TouchableOpacity>
        {photoPath && (
          <Image source={{ uri: photoPath }} style={styles.photoPreview} />
        )}

        {/* YouTube Link */}
        <Text style={styles.label}>YouTube Link (optional)</Text>
        <TextInput
          style={styles.input}
          value={youtubeLink}
          onChangeText={setYoutubeLink}
          placeholder="https://youtube.com/watch?v=..."
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients *</Text>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, styles.ingName]}
              value={ing.name}
              onChangeText={v => updateIngredient(i, 'name', v)}
              placeholder="Ingredient name"
            />
            <TextInput
              style={[styles.input, styles.ingQty]}
              value={ing.quantity}
              onChangeText={v => updateIngredient(i, 'quantity', v)}
              placeholder="Qty"
            />
            <TouchableOpacity onPress={() => removeIngredient(i)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
          <Ionicons name="add-circle-outline" size={18} color="#FF6B35" />
          <Text style={styles.addBtnText}>Add Ingredient</Text>
        </TouchableOpacity>

        {/* Steps */}
        <Text style={styles.label}>Steps *</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={step}
              onChangeText={v => updateStep(i, v)}
              placeholder={`Step ${i + 1}`}
              multiline
            />
            <TouchableOpacity onPress={() => removeStep(i)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addStep}>
          <Ionicons name="add-circle-outline" size={18} color="#FF6B35" />
          <Text style={styles.addBtnText}>Add Step</Text>
        </TouchableOpacity>

        {/* Calories */}
        <Text style={styles.label}>Calories (optional)</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="e.g. 350"
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  saveBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 12 },
  saveBtnText: { fontSize: 20, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  label: {
    fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#E0E0E0', color: '#333',
  },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  slotChipActive: { backgroundColor: '#FFF3E0' },
  slotChipText: { fontSize: 14, color: '#666' },
  slotChipTextActive: { color: '#FF6B35', fontWeight: '600' },
  cuisineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cuisineChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  cuisineChipActive: { backgroundColor: '#E8F5E9' },
  cuisineChipText: { fontSize: 13, color: '#666' },
  cuisineChipTextActive: { color: '#2E7D32', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  diffRow: { flexDirection: 'row', gap: 6 },
  diffChip: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  diffChipActive: { backgroundColor: '#FF6B35' },
  diffChipText: { fontSize: 13, color: '#666' },
  diffChipTextActive: { color: '#fff', fontWeight: '600' },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  photoBtnText: { fontSize: 14, color: '#888' },
  photoPreview: { width: '100%', height: 180, borderRadius: 10, marginTop: 8 },
  ingredientRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
  ingName: { flex: 2 },
  ingQty: { flex: 1 },
  removeBtn: { padding: 8 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, color: '#FF6B35', fontWeight: '600' },
  stepRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'flex-start' },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepInput: { flex: 1, minHeight: 44 },
});