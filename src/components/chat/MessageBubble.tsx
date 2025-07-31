// src/components/chat/MessageBubble.tsx
// Create this new component to display individual chat messages
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'leader':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'leader':
        return '⭐';
      case 'member':
        return '👤';
      default:
        return '👁️';
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-lg shadow-sm ${
            isCurrentUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          {!isCurrentUser && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-sm">{message.displayName}</span>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getRoleBadgeColor(message.role)}`}>
                <span>{getRoleIcon(message.role)}</span>
                <span>{message.role}</span>
              </span>
            </div>
          )}
          <p className="text-sm leading-relaxed">{message.text}</p>
          <p className={`text-xs mt-2 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
