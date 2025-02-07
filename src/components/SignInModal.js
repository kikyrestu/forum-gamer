"use client";

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { LoadingSpinner } from './LoadingSpinner';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export function SignInModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestUsername, setGuestUsername] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Gagal sign in dengan Google');
    }
    setLoading(false);
  };

  const continueAsGuest = async (e) => {
    e.preventDefault();
    if (!guestUsername.trim()) return;

    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      
      // Set custom display name for guest user
      await updateProfile(result.user, {
        displayName: guestUsername
      });

      // Save additional user info to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        username: guestUsername,
        type: 'guest',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      onSuccess(result.user);
    } catch (error) {
      console.error('Error signing in as guest:', error);
      setError('Gagal sign in sebagai guest');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0A192F] border border-emerald-500/20 rounded-2xl w-full max-w-md p-8
        shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
          from-emerald-400 to-teal-400 text-center mb-6">
          Join GamerZone
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!showGuestForm ? (
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full px-6 py-3 bg-white rounded-xl font-semibold text-gray-800
                hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0A192F] text-slate-400">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuestForm(true)}
              disabled={loading}
              className="w-full px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl
                font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300"
            >
              Continue as Guest
            </button>
          </div>
        ) : (
          <form onSubmit={continueAsGuest} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Choose your username</label>
              <input
                type="text"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-[#112240] text-slate-300 rounded-xl px-4 py-3
                  border border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none
                  placeholder-slate-500"
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]+"
                title="Letters, numbers and underscore only"
                required
              />
              <p className="text-xs text-slate-500 mt-1">3-20 characters, letters and numbers only</p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowGuestForm(false)}
                className="flex-1 px-4 py-2 text-slate-400 hover:text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !guestUsername.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl
                  font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed
                  hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
              >
                {loading ? <LoadingSpinner /> : 'Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 