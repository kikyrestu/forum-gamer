"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LoadingSpinner } from './LoadingSpinner';

export function ProfileModal({ user, userPreferences, onClose }) {
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState(
    userPreferences?.games?.map(g => g.gameId) || []
  );
  
  const gameOptions = [
    {
      id: 'valorant',
      name: 'Valorant',
      icon: '🎯',
      roles: ['Duelist', 'Controller', 'Sentinel', 'Initiator'],
      rank: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum']
    },
    {
      id: 'mlbb',
      name: 'Mobile Legends',
      icon: '⚔️',
      roles: ['Marksman', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Support'],
      rank: ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic']
    },
    {
      id: 'genshin',
      name: 'Genshin Impact',
      icon: '🎮',
      roles: ['Main DPS', 'Sub DPS', 'Support', 'Healer'],
      rank: ['AR 1-20', 'AR 21-40', 'AR 41-55', 'AR 56+']
    }
  ];

  const updatePreferences = async () => {
    setLoading(true);
    try {
      const gamePreferences = selectedGames.map(gameId => {
        const game = gameOptions.find(g => g.id === gameId);
        return {
          gameId,
          name: game.name,
          mainRole: document.querySelector(`select[name="${gameId}-role"]`).value,
          rank: document.querySelector(`select[name="${gameId}-rank"]`).value
        };
      });

      await updateDoc(doc(db, 'users', user.uid), {
        games: gamePreferences,
        lastUpdated: new Date().toISOString()
      });

      onClose();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0A192F] border border-emerald-500/20 rounded-2xl w-full max-w-2xl p-8
        shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
            from-emerald-400 to-teal-400">
            Your Gaming Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {gameOptions.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (selectedGames.includes(game.id)) {
                    setSelectedGames(selectedGames.filter(id => id !== game.id));
                  } else {
                    setSelectedGames([...selectedGames, game.id]);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300
                  ${selectedGames.includes(game.id)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-emerald-500/20 hover:border-emerald-500/50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h4 className="font-semibold text-slate-100">{game.name}</h4>
                    <p className="text-xs text-slate-400">{game.roles.length} roles available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedGames.length > 0 && (
            <div className="space-y-4 mt-6">
              {selectedGames.map(gameId => {
                const game = gameOptions.find(g => g.id === gameId);
                const currentPrefs = userPreferences?.games?.find(g => g.gameId === gameId);
                
                return (
                  <div key={gameId} className="p-4 rounded-xl bg-[#112240]">
                    <h4 className="text-lg font-semibold text-emerald-400 mb-3">{game.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Main Role</label>
                        <select
                          name={`${gameId}-role`}
                          defaultValue={currentPrefs?.mainRole}
                          className="w-full bg-[#0A192F] text-slate-300 rounded-xl px-4 py-3
                            border border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none"
                        >
                          {game.roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">Rank</label>
                        <select
                          name={`${gameId}-rank`}
                          defaultValue={currentPrefs?.rank}
                          className="w-full bg-[#0A192F] text-slate-300 rounded-xl px-4 py-3
                            border border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none"
                        >
                          {game.rank.map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={updatePreferences}
            disabled={loading || selectedGames.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl
              font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed
              hover:from-emerald-500 hover:to-teal-500 transition-all duration-300
              flex items-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 