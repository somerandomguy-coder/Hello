import React, { useState } from 'react';
import { User as UserType } from '../types/kanban';
import { User, Plus, UserCheck, Sparkles, Trash2 } from 'lucide-react';

interface UserSelectionModalProps {
  existingUsers: UserType[];
  onSelectUser: (userName: string) => void;
  onDeleteUser: (user: UserType) => void;
}

export const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  existingUsers,
  onSelectUser,
  onDeleteUser,
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
            Who is using the workspace right now? Select your name, register a new user, or remove existing ones.
          </p>
        </div>

        {/* Existing Users List */}
        {existingUsers.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-sans">
              Select or Remove Workspace Member ({existingUsers.length})
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
              {existingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#2c2c2c] dark:border-[#555] bg-white dark:bg-[#24242e] hover:bg-[#81b29a]/15 dark:hover:bg-[#81b29a]/15 transition-all sketch-box font-hand text-lg font-bold group"
                >
                  <button
                    onClick={() => onSelectUser(user.name)}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-full border border-[#2c2c2c] bg-[#e07a5f] text-white flex items-center justify-center text-sm font-sans font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-[#2c2c2c] dark:text-[#e4e4e7]">{user.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove member "${user.name}" from workspace?`)) {
                        onDeleteUser(user);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title={`Delete ${user.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
