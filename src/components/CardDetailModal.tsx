import React, { useState } from 'react';
import { Card, Column, User } from '../types/kanban';
import { X, UserPlus, Clock, Layout, FileText, Trash2, Check } from 'lucide-react';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  workspaceUsers: User[];
  currentUser: string;
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  workspaceUsers,
  currentUser,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [columnId, setColumnId] = useState(card.column_id);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(card.assigned_to || []);

  const toggleAssignMember = (memberName: string) => {
    if (assignedMembers.includes(memberName)) {
      setAssignedMembers(assignedMembers.filter((m) => m !== memberName));
    } else {
      setAssignedMembers([...assignedMembers, memberName]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...card,
      title: title.trim(),
      description: description.trim(),
      column_id: columnId,
      assigned_to: assignedMembers,
    });
    onClose();
  };

  const formattedDate = new Date(card.updated_at).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#faf9f5] dark:bg-[#1a1a20] border-4 border-[#2c2c2c] dark:border-[#555] p-6 rounded-2xl shadow-[8px_8px_0px_0px_#2c2c2c] dark:shadow-[8px_8px_0px_0px_#666]">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card Title..."
              className="w-full text-2xl font-hand font-bold bg-white dark:bg-[#24242e] text-[#2c2c2c] dark:text-[#f4f1de] border-2 border-[#2c2c2c] dark:border-[#555] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#e07a5f]"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Column Select */}
        <div className="mb-4 flex items-center gap-2 text-sm font-sans text-gray-600 dark:text-gray-400">
          <Layout className="w-4 h-4 text-[#e07a5f]" />
          <span>In column:</span>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="px-3 py-1 bg-white dark:bg-[#24242e] text-[#2c2c2c] dark:text-[#f4f1de] border-2 border-[#2c2c2c] dark:border-[#555] rounded-lg font-hand font-bold text-base focus:outline-none"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-sans flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#e07a5f]" /> Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            rows={4}
            className="w-full p-3 rounded-xl border-2 border-[#2c2c2c] dark:border-[#555] bg-white dark:bg-[#24242e] text-[#2c2c2c] dark:text-[#e4e4e7] font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#e07a5f] shadow-[2px_2px_0px_0px_#2c2c2c]"
          />
        </div>

        {/* Assigned Workspace Members */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-sans flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-[#e07a5f]" /> Assign Workspace Members
          </label>
          <div className="flex flex-wrap gap-2">
            {workspaceUsers.map((user) => {
              const isAssigned = assignedMembers.includes(user.name);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAssignMember(user.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#2c2c2c] dark:border-[#555] font-hand font-bold text-base transition-all ${
                    isAssigned
                      ? 'bg-[#81b29a] text-black shadow-[2px_2px_0px_0px_#2c2c2c]'
                      : 'bg-white dark:bg-[#24242e] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {isAssigned && <Check className="w-4 h-4 stroke-[3]" />}
                  <span>{user.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Metadata / Last Edited Info */}
        <div className="p-3 mb-6 rounded-xl border border-dashed border-[#2c2c2c]/30 dark:border-[#555]/50 bg-[#f4f1de]/50 dark:bg-[#22222a] flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-sans">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#e07a5f]" />
            <span>
              Last updated by <strong className="text-[#2c2c2c] dark:text-[#f4f1de]">{card.updated_by}</strong> on {formattedDate}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-[#2c2c2c]/20 dark:border-[#555]/40">
          <button
            onClick={() => {
              onDelete(card.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-hand font-bold text-base transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Card</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 font-hand font-bold text-lg hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="sketch-button px-5 py-2 bg-[#e07a5f] text-white font-hand font-bold text-lg rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
