'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { api } from "@/app/lib/api";
import { getSocket } from "@/app/lib/socket";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user && user.token) {
      initializeSocket(user.token);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) loadRooms();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleReceive = (msg) => {
      const normalizedMsg = {
        ...msg,
        sender: msg.sender || (msg.senderId ? { _id: msg.senderId } : null),
      };
      if (msg.room === activeRoom) {
        setMessages(prev => [...prev, normalizedMsg]);
      }
    };

    const handleNewRoom = (room) => {
      console.log(" New room received:", room);
    setRooms(prev => {
      if (prev.some(r => r._id === room._id)) return prev;
      return [room, ...prev];
    });
  };

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    socket.on('receive-message', handleReceive);
    socket.on('new-room', handleNewRoom);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive-message', handleReceive);
      socket.off('new-room', handleNewRoom);
    };
  }, [user, activeRoom]);

  const loadRooms = async () => {
    try {
      const { rooms } = await api.getRooms();
      setRooms(rooms);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
  const handler = async () => {
    const username = prompt("Enter username to chat with:");
    if (!username) return;
    try {
      const { users } = await api.getUserIdsByUsernames([username]);
      if (!users.length) return alert("User not found");
      const { room } = await api.createRoom(users.map(u => u._id));
      await loadRooms();
      loadMessages(room._id);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  window.addEventListener('newChatTriggered', handler);
  return () => window.removeEventListener('newChatTriggered', handler);
}, []);

  const loadMessages = async (roomId) => {
    try {
      const { messages } = await api.getMessages(roomId);
      setMessages(messages);
      setActiveRoom(roomId);
      getSocket().emit('join-room', roomId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    try {
      getSocket().emit('send-message', {
        roomId: activeRoom,
        content: newMessage
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-slate-800/80 backdrop-blur-md border-r border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map(r => (
            <div
              key={r._id}
              onClick={() => loadMessages(r._id)}
              className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer ${
                activeRoom === r._id ? 'bg-slate-700/30' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 flex items-center justify-center text-white font-bold mr-3">
                  {(r.name || 'R').charAt(0).toUpperCase()}
                </div>
                <div className="text-white">
                  {r.name || r.participants.map(p => p.username).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800/30 backdrop-blur-sm">
        <div className="p-4 border-b border-slate-700/50">
          {activeRoom ? (
            <h2 className="font-bold text-white">
              {rooms.find(r => r._id === activeRoom)?.name || 'Chat'}
            </h2>
          ) : (
            <div className="flex items-center justify-between">
            <h2 className="text-white">Select a conversation</h2>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const senderIdStr = msg.sender?._id?.toString() || null;
            const userIdStr = user._id?.toString() || null;
            const isMine = senderIdStr && userIdStr && senderIdStr === userIdStr;
            const isSystem = msg.system;
            console.log(isMine,isSystem,senderIdStr, userIdStr, msg.sender?._id, user._id);
            
            return (
              <div
                key={msg._id}
                className={`flex ${
                  isSystem ? 'justify-center' : isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isSystem
                      ? 'bg-slate-600 text-white'
                      : isMine
                      ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-white'
                      : 'bg-slate-700/50 text-white'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {activeRoom && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center bg-slate-700/50 rounded-lg p-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-white px-3 py-2 outline-none"
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-white"
              >
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
