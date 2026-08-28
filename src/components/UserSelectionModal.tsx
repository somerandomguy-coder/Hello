import React, { useState } from 'react';
import { User as UserType } from '../types/kanban';
import { User, Plus, UserCheck, Sparkles } from 'lucide-react';

interface UserSelectionModalProps {
  existingUsers: UserType[];
  onSelectUser: (userName: string) => void;
}

export const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  existingUsers,
  onSelectUser,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Please enter your name');
      return;
    }
    onSelectUser(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#faf9f5] dark:bg-[#1a1a20] border-4 border-[#2c2c2c] dark:border-[#555] p-6 rounded-2xl shadow-[8px_8px_0px_0px_#2c2c2c] dark:shadow-[8px_8px_0px_0px_#666]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 sketch-border bg-[#f2cc8f] text-[#2c2c2c] mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold font-hand text-[#2c2c2c] dark:text-[#f4f1de]">
            Welcome to Hello!
          </h2>
          <p className="text-sm font-sans text-gray-600 dark:text-gray-400 mt-1">
            Who is using the workspace right now? Select your name or register a new user.
          </p>
        </div>

        {/* Existing Users List */}
        {existingUsers.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-sans">
              Select Existing Member ({existingUsers.length})
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {existingUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user.name)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-[#2c2c2c] dark:border-[#555] bg-white dark:bg-[#24242e] hover:bg-[#81b29a]/20 dark:hover:bg-[#81b29a]/20 text-[#2c2c2c] dark:text-[#e4e4e7] text-left transition-all sketch-box font-hand text-lg font-bold group"
                >
                  <div className="w-8 h-8 rounded-full border border-[#2c2c2c] bg-[#e07a5f] text-white flex items-center justify-center text-sm font-sans font-bold group-hover:scale-110 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {existingUsers.length > 0 && (
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-[#2c2c2c]/30 dark:border-[#555]/40" />
            </div>
            <span className="relative px-3 bg-[#faf9f5] dark:bg-[#1a1a20] text-xs font-bold font-sans text-gray-400 uppercase tracking-wider">
              or create new
            </span>
          </div>
        )}

        {/* Create New User Form */}
        <form onSubmit={handleCreateNew} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 font-sans">
              Enter Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Alex, Sam, Taylor..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#2c2c2c] dark:border-[#666] bg-white dark:bg-[#24242e] text-[#2c2c2c] dark:text-[#e4e4e7] font-hand text-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] shadow-[2px_2px_0px_0px_#2c2c2c]"
                autoFocus
              />
              <User className="absolute right-3.5 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            {error && <p className="text-xs text-red-500 font-sans mt-1 font-semibold">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-[#e07a5f] hover:bg-[#d0694e] text-white font-hand text-xl font-bold rounded-xl border-2 border-[#2c2c2c] dark:border-[#666] shadow-[4px_4px_0px_0px_#2c2c2c] dark:shadow-[4px_4px_0px_0px_#666] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            Join Workspace as {nameInput.trim() || 'Guest'}
          </button>
        </form>
      </div>
    </div>
  );
};
