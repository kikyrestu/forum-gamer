"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Listen to online users
    const q = query(
      collection(db, 'users'),
      where('lastActive', '>', serverTimestamp() - 300000) // 5 minutes
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOnlineUsers(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  return onlineUsers;
} 