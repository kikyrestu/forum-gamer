"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  getDoc,
  doc
} from 'firebase/firestore';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to last 50 messages
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (user, text) => {
    if (!text.trim()) return;

    try {
      // Get user preferences for roles
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const gameRoles = userData?.games?.map(g => `${g.name} ${g.mainRole}`) || [];

      await addDoc(collection(db, 'messages'), {
        text,
        userId: user.uid,
        username: user.displayName || 'Guest User',
        userPhotoURL: user.photoURL || null,
        isGuest: userData?.type === 'guest',
        gameRoles,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return { messages, loading, sendMessage };
} 