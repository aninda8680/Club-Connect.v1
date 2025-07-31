// src/hooks/useClubMembership.ts
// Create this new custom hook to check user's club membership status
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { ClubMembership } from '../types/chat';

export const useClubMembership = (clubId: string, userId: string): ClubMembership => {
  const [membership, setMembership] = useState<ClubMembership>({
    role: null,
    isAllowedInChat: false,
    loading: true
  });

  useEffect(() => {
    const fetchMembership = async () => {
      if (!clubId || !userId) {
        setMembership({ role: null, isAllowedInChat: false, loading: false });
        return;
      }

      try {
        // First check if user is the leader
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        if (clubDoc.exists() && clubDoc.data().leaderId === userId) {
          setMembership({ role: 'leader', isAllowedInChat: true, loading: false });
          return;
        }

        // Then check if user is a member
        const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', userId));
        if (memberDoc.exists()) {
          const role = memberDoc.data().role as 'admin' | 'leader' | 'member' | 'visitor';
          const isAllowedInChat = role === 'leader' || role === 'member';
          setMembership({ role, isAllowedInChat, loading: false });
        } else {
          // Check if user is admin by checking their user document
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setMembership({ role: 'admin', isAllowedInChat: true, loading: false });
          } else {
            setMembership({ role: 'visitor', isAllowedInChat: false, loading: false });
          }
        }
      } catch (error) {
        console.error('Error fetching club membership:', error);
        setMembership({ role: null, isAllowedInChat: false, loading: false });
      }
    };

    fetchMembership();
  }, [clubId, userId]);

  return membership;
};
