// src/components/chat/ChatPanel.tsx
// Create this wrapper component to handle access control
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useClubMembership } from '../../hooks/useClubMembership';
import ClubChat from './ClubChat';

interface ChatPanelProps {
  clubId: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ clubId }) => {
  const [user, loading, error] = useAuthState(auth);
  const { role, isAllowedInChat, loading: membershipLoading } = useClubMembership(
    clubId, 
    user?.uid || ''
  );

  if (loading || membershipLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading chat. Please try refreshing the page.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-gray-600 font-medium mb-2">Authentication Required</p>
        <p className="text-sm text-gray-500">Please log in to access the chat.</p>
      </div>
    );
  }

  if (!isAllowedInChat) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-gray-600 font-medium mb-2">Chat Access Restricted</p>
        <p className="text-sm text-gray-500 mb-4">
          Chat is available only for club members and leaders.
        </p>
        {role === 'visitor' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Request Membership
          </button>
        )}
      </div>
    );
  }

  return <ClubChat clubId={clubId} userRole={role!} />;
};

export default ChatPanel;
