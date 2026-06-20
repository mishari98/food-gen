import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../context/MealPlanContext';

export default function DebugPage() {
  const { user, dayPlan } = useMealPlan() as any;
  const [allMeals, setAllMeals] = useState<any[]>([]);
  const [mealsLoaded, setMealsLoaded] = useState(false);
  const [firestoreMeals, setFirestoreMeals] = useState<any[]>([]);
  const [firestorePlans, setFirestorePlans] = useState<any[]>([]);

  const loadFirestoreData = async () => {
    if (!user?.uid) return;
    const { getMealsFromFirestore, getAllDayPlansFromFirestore } = await import('../firebase/firestore');
    const meals = await getMealsFromFirestore(user.uid);
    const plans = await getAllDayPlansFromFirestore(user.uid);
    setFirestoreMeals(meals);
    setFirestorePlans(plans);
    setAllMeals(meals);
    setMealsLoaded(meals.length > 0);
  };

  const clearAllData = async () => {
    if (!user?.uid) return;
    if (!confirm('Delete ALL data? This cannot be undone.')) return;
    
    const { deleteDoc, collection, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    // Delete all custom meals
    const mealsSnap = await getDocs(collection(db, 'users', user.uid, 'customMeals'));
    for (const doc of mealsSnap.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete all day plans
    const plansSnap = await getDocs(collection(db, 'users', user.uid, 'dayPlans'));
    for (const doc of plansSnap.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete preferences
    const prefsDoc = await import('firebase/firestore').then(m => m.doc(db, 'users', user.uid, 'preferences', 'main'));
    await import('firebase/firestore').then(m => m.deleteDoc(prefsDoc));
    
    // Clear localStorage
    localStorage.clear();
    
    alert('All data deleted. Reloading...');
    window.location.reload();
  };

  return (
    <div className="page-container">
      <div className="header">
        <div className="header-title">
          <span className="app-title">🔧 Debug</span>
        </div>
      </div>

      <div className="content-area">
        <div className="debug-section">
          <h3>User Info</h3>
          <pre>{JSON.stringify({ uid: user?.uid, displayName: user?.displayName }, null, 2)}</pre>
        </div>

        <div className="debug-section">
          <h3>Meals State</h3>
          <p>mealsLoaded: {mealsLoaded ? '✅ Yes' : '❌ No'}</p>
          <p>allMeals count: {allMeals.length}</p>
          <p>Sample meal IDs: {allMeals.slice(0, 5).map((m: any) => m.id).join(', ')}</p>
        </div>

        <div className="debug-section">
          <h3>Current Day Plan</h3>
          <pre>{JSON.stringify(dayPlan, null, 2)}</pre>
        </div>

        <div className="debug-section">
          <h3>Firestore Meals ({firestoreMeals.length})</h3>
          <button onClick={loadFirestoreData}>Refresh from Firestore</button>
          <pre>{JSON.stringify(firestoreMeals.slice(0, 3), null, 2)}</pre>
        </div>

        <div className="debug-section">
          <h3>Firestore Plans ({firestorePlans.length})</h3>
          <pre>{JSON.stringify(firestorePlans.slice(0, 3), null, 2)}</pre>
        </div>

        <div className="debug-section">
          <h3>Danger Zone</h3>
          <button className="danger-btn" onClick={clearAllData}>💣 Delete DB & Reload</button>
          <p>This will delete all Firestore data and localStorage, then reload the app.</p>
        </div>
      </div>
    </div>
  );
}