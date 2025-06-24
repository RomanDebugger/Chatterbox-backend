'use client';
import { useState } from 'react';
import { api } from '@/app/lib/api';
import { getSocket } from '@/app/lib/socket';

export default function NewRoomModal({ open, onClose }) {
  const [type, setType] = useState('private');
  const [name, setName] = useState('');
  const [usernames, setUsernames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const participantUsernames = usernames.split(',').map(u => u.trim());
      const { users } = await api.getUserIdsByUsernames(participantUsernames);
      const participantIds = users.map(u => u._id);

      const socket = getSocket();
      socket.emit('create-room', {
        participantIds,
        type,
        name: type === 'group' ? name : undefined,  
      }, (response) => {
        if (response.error) {
          setError(response.error);
        } else {
          console.log('Room created:', response.room);
          onClose();
        }
        setLoading(false);
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create room');
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-100 h-full bg-slate-900 border-l border-slate-700 p-4 z-50">
      <h2 className="text-lg font-semibold text-white mb-4">New Room</h2>

      <div className="mb-2">
        <label className="block text-sm text-slate-400 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-slate-800 text-white p-2 rounded"
        >
          <option value="private">Private</option>
          <option value="group">Group</option>
        </select>
      </div>

      {type === 'group' && (
        <div className="mb-2">
          <label className="block text-sm text-slate-400 mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 text-white p-2 rounded"
            placeholder="Group name"
          />
        </div>
      )}

      <div className="mb-2">
        <label className="block text-sm text-slate-400 mb-1">Participants (comma-separated usernames)</label>
        <input
          type="text"
          value={usernames}
          onChange={(e) => setUsernames(e.target.value)}
          className="w-full bg-slate-800 text-white p-2 rounded"
          placeholder="e.g. alice,bob,charlie"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="flex justify-between mt-4">
        <button
          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={handleCreate}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  );
}
