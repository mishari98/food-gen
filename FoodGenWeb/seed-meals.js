import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyC0heootIW6A4L324dNq_w_AWoXtoDimVU",
  authDomain: "foodgen-85dbb.firebaseapp.com",
  projectId: "foodgen-85dbb",
  storageBucket: "foodgen-85dbb.firebasestorage.app",
  messagingSenderId: "703155908420",
  appId: "1:703155908420:web:c557aa9c0b08c803143111"
};

async function seedMeals() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const mealsPath = path.join(process.cwd(), 'src', 'data', 'meals.json');
  const meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8'));
  console.log(`Seeding ${meals.length} meals to Firebase...`);

  for (const meal of meals) {
    try {
      await setDoc(doc(db, 'referenceMeals', String(meal.id || meal.name)), {
        ...meal,
        id: meal.id || Date.now() + Math.random(),
        isCustom: 0,
        isFavorite: 0,
      });
      console.log(`✓ Added: ${meal.name}`);
    } catch (error) {
      console.error(`✗ Failed to add ${meal.name}:`, error);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seedMeals();