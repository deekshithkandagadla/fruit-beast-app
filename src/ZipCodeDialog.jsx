import React, { useState } from 'react';

export default function ZipCodeDialog({ onSubmit, initialZip }) {
  const [zip, setZip] = useState(initialZip || '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setError('Please enter a valid 5-digit zip code.');
      return;
    }
    setError('');
    onSubmit(zip);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-80 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Enter Your Zip Code</h2>
        <input
          type="text"
          value={zip}
          onChange={e => setZip(e.target.value)}
          maxLength={5}
          className="border p-2 rounded w-full mb-2 text-center"
          placeholder="Zip Code"
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full">Submit</button>
      </form>
    </div>
  );
}
