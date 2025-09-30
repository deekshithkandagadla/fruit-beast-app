import React, { useState } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Store user info in Firestore if new
  async function storeUser(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'guest',
        isAnonymous: user.isAnonymous,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    try {
      let userCred;
      if (isSignUp) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      await storeUser(userCred.user);
      onAuth(userCred.user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGuest() {
    setError('');
    try {
      const userCred = await signInAnonymously(auth);
      await storeUser(userCred.user);
      onAuth(userCred.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mb-2 hover:bg-blue-600">
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleGuest}
          className="w-full bg-gray-300 text-gray-700 py-2 rounded mb-2 hover:bg-gray-400"
        >
          Continue as Guest
        </button>
        <div className="text-center">
          <button
            type="button"
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setIsSignUp(s => !s)}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}
