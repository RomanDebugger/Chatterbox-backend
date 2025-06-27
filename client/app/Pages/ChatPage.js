'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../hooks/useRoom';
import { useRooms } from '../hooks/useRooms';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeRoom, setActiveRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const lastMessageRef = useRef(null);
  
  const {
    room,
    messages = [],
    typingUsers,
    sendMessage,
    sendTyping
  } = useRoom(activeRoom);

  const { rooms, loadRooms, createNewRoomWithUser } = useRooms(user);

  console.log("okokok", rooms, room, messages, typingUsers);
  

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleNewChat = async () => {
    const username = prompt('Enter username to chat with:');
    if (!username) return;
    const room = await createNewRoomWithUser(username);
    if (room) {
      setActiveRoom(room._id);
    }
  };

  useEffect(() => {
    window.addEventListener('newChatTriggered', handleNewChat);
    return () => window.removeEventListener('newChatTriggered', handleNewChat);
  }, []);

  useEffect(()=>{
    if(lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  },[messages]);
  return (
    <div className="flex h-screen">
      <div className="w-80 bg-slate-800/80 backdrop-blur-md border-r border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...rooms]
            .sort((a, b) => new Date(b?.lastActivityAt || 0) - new Date(a?.lastActivityAt || 0))
            .map(r => (
            <div
              key={r._id}
              onClick={() => setActiveRoom(r._id)}
              className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer ${activeRoom === r._id ? 'bg-slate-700/30' : ''}`}
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
          {room ? (
            <h2 className="font-bold text-white">{room.name || 'Chat'}</h2>
          ) : (
            <h2 className="text-white">Select a conversation</h2>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg,idx)=> {
            const isMine = user && msg.sender?._id === user._id;
            const isSystem = msg.system;
            const isLast = idx === messages.length - 1;
            return (
              <div
                key={msg._id}
                ref = {isLast ? lastMessageRef : null}
               className={`flex ${isSystem ? 'justify-center' : isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isSystem
                    ? 'bg-slate-600 text-white'
                    : isMine
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-white'
                    : 'bg-slate-700/50 text-white'
                    }`}
                >
                  <span className='font-semibold'>{isSystem ? 'System' : msg.sender?.username || 'unkonwn user'}</span>
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {typingUsers.length > 0 && (
  <div className="p-2 text-sm text-slate-300 italic">
    {typingUsers.length === 1
      ? `${typingUsers[0].username} is typing...`
      : `${typingUsers.map(u => u.username).join(', ')} are typing...`}
  </div>
)}



        {room && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center bg-slate-700/50 rounded-lg p-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => {
                  sendTyping();
                  if (e.key === 'Enter') handleSend();
                }}
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
