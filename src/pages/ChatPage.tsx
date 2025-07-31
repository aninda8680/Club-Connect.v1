import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust path
import { useAuth } from "../AuthContext"; // Adjust path
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: any;
}

interface ChatPageProps {
  clubId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ clubId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `clubs/${clubId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) =>
        msgs.push({ id: doc.id, ...(doc.data() as Omit<Message, "id">) })
      );
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [clubId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, `clubs/${clubId}/messages`), {
      content: input.trim(),
      senderId: user.uid,
      senderRole: user.role,
      createdAt: serverTimestamp()
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-md border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg w-fit max-w-xs ${
              msg.senderId === user?.uid
                ? "ml-auto bg-blue-100 text-right"
                : "bg-gray-100"
            }`}
          >
            <div className="text-sm font-semibold text-gray-600 mb-1">
              {msg.senderRole === "system"
                ? "System"
                : msg.senderId === user?.uid
                ? "You"
                : msg.senderRole}
            </div>
            <div className="text-gray-800">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center border-t p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-4 py-2 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
