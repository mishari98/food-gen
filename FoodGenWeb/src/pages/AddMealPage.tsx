import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import { saveCustomMeal } from '../firebase/firestore';
import type { Ingredient, Meal } from '../types/meal';

interface IngredientField {
  name: string;
  quantity: string;
}

export default function AddMealPage() {
  const navigate = useNavigate();
  const { user } = useMealPlan();

  const [name, setName] = useState('');
  const [suggestedFor, setSuggestedFor] = useState<string[]>(['lunch', 'dinner']);
  const [cuisine, setCuisine] = useState('Filipino');
  const [prepTime, setPrepTime] = useState('30');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [emoji, setEmoji] = useState('🍽️');
  const [ingredients, setIngredients] = useState<IngredientField[]>([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [calories, setCalories] = useState('');

  const slots = [
    { id: 'breakfast', label: '🌅 Breakfast' },
    { id: 'lunch', label: '☀️ Lunch' },
    { id: 'dinner', label: '🌙 Dinner' },
    { id: 'snack', label: '🍿 Snack' },
  ];

  const toggleSlot = (slot: string) => {
    setSuggestedFor(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const updateIngredient = (index: number, field: keyof IngredientField, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) { alert('Please enter a meal name'); return; }
    if (suggestedFor.length === 0) { alert('Please select at least one meal slot'); return; }
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) { alert('Please add at least one ingredient'); return; }

    const mealData = {
      name: name.trim(),
      suggestedFor: suggestedFor,
      cuisine,
      dietaryTags: [],
      prepTimeMinutes: parseInt(prepTime) || 30,
      difficulty,
      emoji,
      ingredients: validIngredients.map(i => ({ name: i.name.trim(), quantity: i.quantity.trim() })),
      steps: steps.filter(s => s.trim()),
      calories: calories ? parseInt(calories) : null,
      isCustom: 1,
      isFavorite: 0,
    };

    try {
      if (!user?.uid) {
        alert('You must be logged in to add meals.');
        return;
      }
      await saveCustomMeal(user.uid, mealData as any);
      alert('🍽️ ' + name.trim() + ' added to your meals!');
      navigate('/day');
    } catch (e) {
      console.error('Error saving meal:', e);
      alert('Failed to save meal. Please try again. Error: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/')}>←</button>
        <div className="header-title">
          <span className="app-title">➕ Add Meal</span>
        </div>
        <button className="save-btn" onClick={handleSave}>💾 Save</button>
      </div>

      <div className="content-area add-meal-form">
        {/* Meal Name */}
        <div className="form-group">
          <label className="form-label">Meal Name *</label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Pork Sisig"
          />
        </div>

        {/* Suggested For */}
        <div className="form-group">
          <label className="form-label">Suggested For *</label>
          <div className="checkbox-group">
            {slots.map(slot => (
              <label key={slot.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={suggestedFor.includes(slot.id)}
                  onChange={() => toggleSlot(slot.id)}
                />
                <span>{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div className="form-group">
          <label className="form-label">Cuisine</label>
          <select className="form-input" value={cuisine} onChange={e => setCuisine(e.target.value)}>
            <option>Filipino</option>
            <option>Italian</option>
            <option>Japanese</option>
            <option>Chinese</option>
            <option>Mexican</option>
            <option>Indian</option>
            <option>American</option>
          </select>
        </div>

        {/* Prep Time */}
        <div className="form-group">
          <label className="form-label">Prep Time (minutes) *</label>
          <input
            className="form-input"
            type="number"
            value={prepTime}
            onChange={e => setPrepTime(e.target.value)}
            placeholder="30"
          />
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <div className="radio-group">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <label key={d} className="radio-label">
                <input
                  type="radio"
                  name="difficulty"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                />
                <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div className="form-group">
          <label className="form-label">Emoji</label>
          <input
            className="form-input"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            placeholder="🍽️"
            maxLength={2}
          />
        </div>

        {/* Ingredients */}
        <div className="form-group">
          <label className="form-label">Ingredients *</label>
          {ingredients.map((ing, i) => (
            <div key={i} className="dynamic-row">
              <input
                className="form-input flex-1"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                placeholder="Ingredient name"
              />
              <input
                className="form-input qty-input"
                value={ing.quantity}
                onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                placeholder="Qty"
              />
              <button className="remove-btn" onClick={() => removeIngredient(i)}>🗑️</button>
            </div>
          ))}
          <button className="add-row-btn" onClick={addIngredient}>+ Add Ingredient</button>
        </div>

        {/* Steps */}
        <div className="form-group">
          <label className="form-label">Steps *</label>
          {steps.map((step, i) => (
            <div key={i} className="dynamic-row">
              <span className="step-number-badge">{i + 1}</span>
              <textarea
                className="form-input flex-1"
                value={step}
                onChange={e => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                rows={2}
              />
              <button className="remove-btn" onClick={() => removeStep(i)}>🗑️</button>
            </div>
          ))}
          <button className="add-row-btn" onClick={addStep}>+ Add Step</button>
        </div>

        {/* Calories */}
        <div className="form-group">
          <label className="form-label">Calories (optional)</label>
          <input
            className="form-input"
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            placeholder="e.g. 320"
          />
        </div>

        {/* Save Button (bottom) */}
        <button className="primary-btn full-width" onClick={handleSave}>
          💾 Save Meal
        </button>
      </div>
    </div>
  );
}