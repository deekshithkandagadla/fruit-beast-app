import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const defaultNutrition = { calories: '', vitamins: '', notes: '' };

export default function FruitLogForm({ onLog }) {
  const [date, setDate] = useState('');
  const [fruit, setFruit] = useState('');
  const [nutrition, setNutrition] = useState(defaultNutrition);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setNutrition({ ...nutrition, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const log = { date, fruit, nutrition };
    try {
      await addDoc(collection(db, 'fruitLogs'), log);
      setDate('');
      setFruit('');
      setNutrition(defaultNutrition);
      if (onLog) onLog();
    } catch (err) {
      alert('Error logging fruit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label className="block mb-1">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block mb-1">Fruit</label>
        <input type="text" value={fruit} onChange={e => setFruit(e.target.value)} required className="border p-2 rounded w-full" placeholder="e.g. Banana" />
      </div>
      <div>
        <label className="block mb-1">Calories</label>
        <input type="number" name="calories" value={nutrition.calories} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block mb-1">Vitamins</label>
        <input type="text" name="vitamins" value={nutrition.vitamins} onChange={handleChange} className="border p-2 rounded w-full" placeholder="e.g. C, B6" />
      </div>
      <div>
        <label className="block mb-1">Notes</label>
        <input type="text" name="notes" value={nutrition.notes} onChange={handleChange} className="border p-2 rounded w-full" placeholder="Optional notes" />
      </div>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Logging...' : 'Log Fruit'}
      </button>
    </form>
  );
}
