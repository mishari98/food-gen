import React, { useState, useEffect } from 'react';
import { db } from '../database/db';

export default function DebugDBPage() {
  const [mealCount, setMealCount] = useState(0);
  const [dayPlanCount, setDayPlanCount] = useState(0);
  const [savedPlanCount, setSavedPlanCount] = useState(0);
  const [meals, setMeals] = useState<any[]>([]);
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'meals' | 'plans' | 'saved' | 'prefs'>('meals');

  async function loadData() {
    // Counts
    const mCount = await db.meals.count();
    const dpCount = await db.dayPlans.count();
    const spCount = await db.savedWeekPlans.count();
    setMealCount(mCount);
    setDayPlanCount(dpCount);
    setSavedPlanCount(spCount);

    // Meals
    const allMeals = await db.meals.toArray();
    setMeals(allMeals.map(m => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      difficulty: m.difficulty,
      cuisine: m.cuisine,
      isCustom: m.isCustom,
      prepTimeMinutes: m.prepTimeMinutes,
      calories: m.calories,
    })));

    // Day plans
    const allDayPlans = await db.dayPlans.toArray();
    setDayPlans(allDayPlans);

    // Saved week plans
    const allSavedPlans = await db.savedWeekPlans.toArray();
    setSavedPlans(allSavedPlans);

    // localStorage preferences
    const prefs: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        prefs[key] = localStorage.getItem(key) || '';
      }
    }
    setPreferences(prefs);
  }

  useEffect(() => {
    loadData();
    // Reload data when the window/tab gets focus (user navigates back)
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  async function handleClearAndReseed() {
    if (!window.confirm('⚠️ Clear ALL data and reseed? This will delete all your custom meals and plans.')) return;
    await db.meals.clear();
    await db.dayPlans.clear();
    await db.savedWeekPlans.clear();
    localStorage.clear();
    window.location.reload();
  }

  async function handleDeleteAndRestart() {
    if (!window.confirm('💣 Delete the ENTIRE database and reload? This will create a fresh database with all tables.')) return;
    await db.delete();
    localStorage.clear();
    window.location.reload();
  }

  async function handleClearDayPlans() {
    if (!window.confirm('Clear all day plans?')) return;
    await db.dayPlans.clear();
    await loadData();
  }

  async function handleClearSavedPlans() {
    if (!window.confirm('Clear all saved week plans?')) return;
    await db.savedWeekPlans.clear();
    await loadData();
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13, padding: 16, background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#FF6B35', margin: 0 }}>🐞 FoodGen DB Debugger</h2>
        <a href="#/" style={{ color: '#2EC4B6' }}>← Back to App</a>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#16213e', padding: '12px 20px', borderRadius: 8, flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 11, color: '#888' }}>MEALS</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#FF6B35' }}>{mealCount}</div>
        </div>
        <div style={{ background: '#16213e', padding: '12px 20px', borderRadius: 8, flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 11, color: '#888' }}>DAY PLANS</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2EC4B6' }}>{dayPlanCount}</div>
        </div>
        <div style={{ background: '#16213e', padding: '12px 20px', borderRadius: 8, flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 11, color: '#888' }}>SAVED WEEKS</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#CE93D8' }}>{savedPlanCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('meals')} style={{
          padding: '8px 16px', background: activeTab === 'meals' ? '#FF6B35' : '#16213e',
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
        }}>🍽️ Meals ({mealCount})</button>
        <button onClick={() => setActiveTab('plans')} style={{
          padding: '8px 16px', background: activeTab === 'plans' ? '#2EC4B6' : '#16213e',
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
        }}>📅 Plans ({dayPlanCount})</button>
        <button onClick={() => setActiveTab('saved')} style={{
          padding: '8px 16px', background: activeTab === 'saved' ? '#CE93D8' : '#16213e',
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
        }}>💾 Saved Weeks ({savedPlanCount})</button>
        <button onClick={() => setActiveTab('prefs')} style={{
          padding: '8px 16px', background: activeTab === 'prefs' ? '#9C27B0' : '#16213e',
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
        }}>⚙️ Preferences</button>
        <button onClick={loadData} style={{
          padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginLeft: 'auto'
        }}>🔄 Refresh</button>
      </div>

      {/* Content */}
      <div style={{ background: '#16213e', borderRadius: 8, padding: 16, overflow: 'auto', maxHeight: '55vh' }}>
        {activeTab === 'meals' && (
          <div>
            {meals.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No meals in database. Seed them on the first app visit.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#FF6B35', textAlign: 'left' }}>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>ID</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Name</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Emoji</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Diff</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Cuisine</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Custom</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Prep</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Cal</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map(m => (
                    <tr key={m.id} style={{ color: m.isCustom ? '#CE93D8' : '#e0e0e0' }}>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{m.id}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222', textAlign: 'center' }}>{m.emoji}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{m.difficulty}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{m.cuisine}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222', textAlign: 'center' }}>{m.isCustom ? '✅' : '—'}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{m.prepTimeMinutes}m</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{m.calories ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            {dayPlans.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No day plans yet. Go to Today or Week tab and generate meals first.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#2EC4B6', textAlign: 'left' }}>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>ID</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Date</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Week</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Breakfast</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Lunch</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Dinner</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Snack</th>
                  </tr>
                </thead>
                <tbody>
                  {dayPlans.map(p => (
                    <tr key={p.id} style={{ color: '#e0e0e0' }}>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.id}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.date}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.weekOfYear}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.breakfastId ?? '—'}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.lunchId ?? '—'}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.dinnerId ?? '—'}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{p.snackId ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedPlans.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No saved week plans yet. Generate a week plan then click "Save This Plan".</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#CE93D8', textAlign: 'left' }}>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>ID</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Name</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Week</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Year</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {savedPlans.map(sp => (
                    <tr key={sp.id} style={{ color: '#e0e0e0' }}>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{sp.id}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{sp.name}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{sp.weekOfYear}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{sp.year}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222' }}>{sp.createdAt || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'prefs' && (
          <div>
            {Object.keys(preferences).length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No preferences in localStorage</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#CE93D8', textAlign: 'left' }}>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Key</th>
                    <th style={{ padding: 6, borderBottom: '1px solid #333' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(preferences).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ padding: 6, borderBottom: '1px solid #222', color: '#aaa' }}>{key}</td>
                      <td style={{ padding: 6, borderBottom: '1px solid #222', color: '#e0e0e0' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ marginTop: 20, padding: 16, background: '#2d1a1a', borderRadius: 8, border: '1px solid #5a2a2a' }}>
        <h3 style={{ color: '#F44336', margin: '0 0 8px', fontSize: 14 }}>⚠️ Danger Zone</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleClearDayPlans} style={{
            padding: '8px 16px', background: '#5a2a2a', color: '#F44336', border: '1px solid #F44336',
            borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 12
          }}>🗑️ Clear Day Plans</button>
          <button onClick={handleClearSavedPlans} style={{
            padding: '8px 16px', background: '#5a2a2a', color: '#F44336', border: '1px solid #F44336',
            borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 12
          }}>🗑️ Clear Saved Weeks</button>
          <button onClick={handleDeleteAndRestart} style={{
            padding: '8px 16px', background: '#6a1010', color: '#FF1744', border: '1px solid #FF1744',
            borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 12
          }}>💣 Delete DB & Reload</button>
          <button onClick={handleClearAndReseed} style={{
            padding: '8px 16px', background: '#5a2020', color: '#FF5252', border: '1px solid #FF5252',
            borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 12
          }}>💣 Clear ALL & Reseed</button>
        </div>
        <p style={{ fontSize: 11, color: '#886', marginTop: 8 }}>
          Make sure to click 🔄 Refresh after going back to the app and saving data. You can also use DevTools → Application → IndexedDB → foodgen
        </p>
      </div>
    </div>
  );
}