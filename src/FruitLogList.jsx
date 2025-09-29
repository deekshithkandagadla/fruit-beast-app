import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function FruitLogList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'fruitLogs'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  if (!logs.length) return <div className="p-4">No fruit logs yet.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Fruit Log History</h2>
      <ul className="space-y-2">
        {logs.map(log => (
          <li key={log.id} className="border rounded p-3 bg-gray-50">
            <div className="font-semibold">{log.date} — {log.fruit}</div>
            <div className="text-sm text-gray-700">Calories: {log.nutrition?.calories || 'N/A'}</div>
            <div className="text-sm text-gray-700">Vitamins: {log.nutrition?.vitamins || 'N/A'}</div>
            {log.nutrition?.notes && <div className="text-xs text-gray-500">Notes: {log.nutrition.notes}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
