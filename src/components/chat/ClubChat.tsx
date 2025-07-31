// src/components/chat/ClubChat.tsx
// Create this new component as the main chat interface
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import type { Message, UserRole } from '../../types/chat';
import MessageBubble from './MessageBubble';

interface ClubChatProps {
  clubId: string;
  userRole: UserRole;
}

const ClubChat: React.FC<ClubChatProps> = ({ clubId, userRole }) => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to messages
  useEffect(() => {
    if (!clubId || !user) return;

    const q = query(
      collection(db, 'clubs', clubId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        const messagesData: Message[] = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !isOnline) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      await addDoc(collection(db, 'clubs', clubId, 'messages'), {
        text: messageText,
        createdAt: serverTimestamp(),
        senderId: user.uid,
        displayName: user.displayName || 'Anonymous User',
        role: userRole,
        clubId: clubId
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text if sending fails
      setNewMessage(messageText);
      alert('Failed to send message. Please try again.');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteDoc(doc(db, 'clubs', clubId, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const canDeleteMessage = (message: Message) => {
    return user && (
      message.senderId === user.uid || 
      userRole === 'leader' || 
      userRole === 'admin'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Club Chat</h3>
            <p className="text-sm opacity-90">Members & Leaders only</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation with your club members!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="group relative">
                <MessageBubble 
                  message={message} 
                  isCurrentUser={message.senderId === user?.uid}
                />
                {canDeleteMessage(message) && (
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        {!isOnline && (
          <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
            You're offline. Messages will be sent when connection is restored.
          </div>
        )}
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
            disabled={!isOnline}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isOnline}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • {500 - newMessage.length} characters remaining
        </p>
      </div>
    </div>
  );
};

export default ClubChat;
