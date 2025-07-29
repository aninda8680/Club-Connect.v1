// src/pages/Chat.tsx

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  role: 'member' | 'leader';
  timestamp: any;
  attachmentURL?: string;
}

const Chat = () => {
  const { clubId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser || !clubId) return;

    // Fetch user name & role
    const fetchUserInfo = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      if (data) setUserInfo({ name: data.name, role: data.role });
    };
    fetchUserInfo();

    const messagesRef = collection(db, 'clubs', clubId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [clubId]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!currentUser || !userInfo || !clubId) return;

    let attachmentURL: string | undefined;

    if (file) {
      const fileRef = ref(storage, `chatFiles/${clubId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      attachmentURL = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, 'clubs', clubId, 'messages'), {
      text: input.trim() || '',
      senderId: currentUser.uid,
      senderName: userInfo.name,
      role: userInfo.role,
      timestamp: serverTimestamp(),
      attachmentURL: attachmentURL || null,
    });

    setInput('');
    setFile(null);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto flex flex-col h-[100dvh]">
      <h2 className="text-xl font-bold mb-4 text-center">💬 Club Chat</h2>

      <div className="flex-1 overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-3 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl w-fit max-w-[75%] ${
              msg.senderId === currentUser?.uid
                ? 'ml-auto bg-blue-200'
                : 'mr-auto bg-white'
            }`}
          >
            <div className="text-sm font-semibold flex items-center gap-2">
              {msg.senderName}
              <span className="text-xs text-gray-500">({msg.role})</span>
            </div>
            <div className="mt-1 text-sm">{msg.text}</div>
            {msg.attachmentURL && (
              <a
                href={msg.attachmentURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 mt-1 underline block"
              >
                📎 Attachment
              </a>
            )}
            <div className="text-[10px] text-gray-500 mt-1 text-right">
              {msg.timestamp?.toDate?.().toLocaleString() || '...'}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="mt-4 flex items-center gap-2">
        <label className="cursor-pointer">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <input
          className="flex-1 border rounded-full px-4 py-2 text-sm"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {file && (
        <div className="text-xs text-gray-500 mt-1">
          📎 Attached: {file.name}{' '}
          <button
            className="ml-2 text-red-500"
            onClick={() => setFile(null)}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
