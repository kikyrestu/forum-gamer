"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ProfileModal } from '@/components/ProfileModal';
import { SignInModal } from '@/components/SignInModal';
import { useChat } from '@/lib/useChat';
import { formatDistanceToNow } from 'date-fns';
import { Toast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { user, signInAsGuest } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(!user);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);
  const [step, setStep] = useState(1); // 1: Welcome, 2: Game Selection, 3: Role Preview
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const { messages, loading: chatLoading, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user already has preferences
  useEffect(() => {
    const checkUserPreferences = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPreferences(userData);
            if (userData.games) {
              setSelectedGames(userData.games.map(g => g.gameId));
              setShowWelcomeModal(false);
            }
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    checkUserPreferences();
  }, [user]);

  const saveUserPreferences = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Authenticate user
      let currentUser = user;
      if (!currentUser) {
        const result = await signInAsGuest();
        if (!result) throw new Error('Failed to authenticate');
        currentUser = result;
      }

      // 2. Validate form data
      const gamePreferences = selectedGames.map(gameId => {
        const game = gameOptions.find(g => g.id === gameId);
        const mainRole = document.querySelector(`select[name="${gameId}-role"]`)?.value;
        const rank = document.querySelector(`select[name="${gameId}-rank"]`)?.value;

        if (!mainRole || !rank) {
          throw new Error(`Please select role and rank for ${game.name}`);
        }

        return {
          gameId,
          name: game.name,
          mainRole,
          rank
        };
      });

      // 3. Prepare user data
      const userData = {
        uid: currentUser.uid,
        username: currentUser.displayName || 'Guest User',
        type: 'guest',
        games: gamePreferences,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      // 4. Save to Firestore
      await setDoc(doc(db, 'users', currentUser.uid), userData);
      
      // 5. Update local state
      setUserPreferences(userData);
      setShowWelcomeModal(false);
      setShowProfileModal(true);

    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    },
    // ... bisa ditambah game lain
  ];

  const threads = [
    {
      id: 1,
      title: 'Tips Jago Main Valorant',
      author: 'ProGamer123',
      replies: 23,
      views: 156,
      lastActive: '5 menit yang lalu',
      category: 'FPS',
      hot: true
    },
    {
      id: 2,
      title: 'Review Mobile Legends Season Terbaru',
      author: 'MLBBPro',
      replies: 45,
      views: 230,
      lastActive: '10 menit yang lalu',
      category: 'MOBA',
      hot: false
    },
    // Bisa ditambah dummy data lainnya
  ];

  const handleSignInSuccess = (user) => {
    setShowSignInModal(false);
    setShowWelcomeModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    await sendMessage(user, newMessage);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#112240] to-[#0A192F]">
      <div className="flex">
        {/* Sidebar dengan tema Razer-ish modern */}
        <div className="w-72 bg-[#0A192F]/95 h-screen p-6 fixed border-r border-emerald-500/10 backdrop-blur-xl">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 text-xl font-extrabold tracking-wide mb-6">
            GAME ZONES
          </h2>
          <ul className="space-y-3">
            {[
              { icon: '🎯', name: 'FPS Games', count: 156 },
              { icon: '⚔️', name: 'MOBA', count: 89 },
              { icon: '🎮', name: 'RPG', count: 234 },
              { icon: '⚽', name: 'Sports', count: 67 }
            ].map((category, idx) => (
              <li key={idx} className="group">
                <a className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 
                  hover:bg-[#112240] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]
                  border border-transparent hover:border-emerald-500/20 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">{category.icon}</span>
                    <span className="text-slate-300 font-medium">{category.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/5 text-emerald-300">
                    {category.count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Forum List dengan tema modern gaming */}
        <div className="ml-72 flex-1 p-8 mr-80">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">Trending Discussions</h2>
              <p className="text-emerald-300/60">Join the hottest gaming conversations 🔥</p>
            </div>
            <button className="relative group px-6 py-3 font-semibold text-white rounded-xl overflow-hidden
              bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-400/50
              transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="relative z-10">+ New Thread</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <div className="space-y-4">
            {threads.map((thread) => (
              <div 
                key={thread.id}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-2xl blur-xl
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6 rounded-2xl bg-[#112240]/50 backdrop-blur-sm border border-emerald-500/10
                  hover:border-emerald-500/30 transition-all duration-300 cursor-pointer
                  hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl text-slate-100 font-bold tracking-wide group-hover:text-transparent 
                      group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400">
                      {thread.title}
                    </h3>
                    {thread.hot && (
                      <span className="px-3 py-1 text-xs font-semibold text-emerald-200 rounded-full 
                        bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/20">
                        🔥 HOT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="text-emerald-300/80">
                      <span className="font-semibold text-emerald-200">@{thread.author}</span>
                    </span>
                    <span className="flex items-center text-slate-400">
                      <span className="mr-2">💬</span> {thread.replies}
                    </span>
                    <span className="flex items-center text-slate-400">
                      <span className="mr-2">👁️</span> {thread.views}
                    </span>
                    <span className="text-slate-400">
                      {thread.lastActive}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat Widget */}
        <div className="fixed right-0 top-0 w-80 h-screen bg-[#0A192F]/95 border-l border-emerald-500/10 backdrop-blur-xl">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-emerald-500/10">
              <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 
                text-xl font-extrabold tracking-wide">
                LIVE CHAT
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {chatLoading ? 'Loading...' : `${messages.length} Messages`}
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="group">
                  <div className="flex items-start space-x-3 p-3 rounded-xl transition-all duration-300
                    hover:bg-[#112240] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 
                      flex items-center justify-center text-emerald-400 text-xs font-bold overflow-hidden">
                      {msg.userPhotoURL ? (
                        <img src={msg.userPhotoURL} alt={msg.username} className="w-full h-full object-cover" />
                      ) : (
                        msg.username.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-300 font-semibold text-sm">{msg.username}</span>
                        {msg.isGuest && (
                          <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">
                            Guest
                          </span>
                        )}
                      </div>
                      {msg.gameRoles?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.gameRoles.map((role, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-[#0A192F] text-slate-400 rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-slate-300 text-sm mt-1">{msg.text}</p>
                      <span className="text-slate-500 text-xs">
                        {msg.createdAt?.toDate() ? 
                          formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 
                          'just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-emerald-500/10">
              <div className="relative">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={user ? "Ketik pesan..." : "Sign in to chat"}
                  disabled={!user}
                  className="w-full bg-[#112240] text-slate-300 rounded-xl px-4 py-3 pr-12
                    border border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none
                    placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={!user || !newMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400
                    hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
          onSuccess={handleSignInSuccess}
        />
      )}

      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#0A192F] border border-emerald-500/20 rounded-2xl w-full max-w-2xl p-8
            shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            
            {step === 1 && (
              <div className="text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text 
                  bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
                  Welcome to GamerZone! 🎮
                </h2>
                <p className="text-slate-300 mb-8">Pilih game favoritmu dan dapatkan role khusus!</p>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl
                    font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all
                    duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-100 mb-6">Pilih Game Favorit Kamu</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedGames.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl
                      font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed
                      hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-100 mb-6">Customize Your Roles</h3>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {selectedGames.map(gameId => {
                  const game = gameOptions.find(g => g.id === gameId);
                  return (
                    <div key={gameId} className="mb-6">
                      <h4 className="text-lg font-semibold text-emerald-400 mb-3">{game.name}</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Main Role</label>
                          <select 
                            name={`${gameId}-role`}
                            className="w-full bg-[#112240] text-slate-300 rounded-xl px-4 py-3
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
                            className="w-full bg-[#112240] text-slate-300 rounded-xl px-4 py-3
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
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-300"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={saveUserPreferences}
                    disabled={loading || selectedGames.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl
                      font-semibold text-white hover:from-emerald-500 hover:to-teal-500 
                      transition-all duration-300 transform hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Let's Go!</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal
          user={user}
          userPreferences={userPreferences}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Show error toast */}
      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
