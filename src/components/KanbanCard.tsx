import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, User } from '../types/kanban';
import { Users, Clock, Edit2, Trash2, CheckSquare } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
  index: number;
  workspaceUsers: User[];
  onCardClick: (card: Card) => void;
  onUpdateTitle: (cardId: string, newTitle: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  index,
  workspaceUsers,
  onCardClick,
  onUpdateTitle,
  onDeleteCard,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(card.title);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleText.trim()) {
      onUpdateTitle(card.id, titleText.trim());
    } else {
      setTitleText(card.title);
    }
    setIsEditingTitle(false);
  };

  const formattedTime = new Date(card.updated_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative mb-3 p-3.5 bg-white dark:bg-[#1e1e24] border-2 border-[#2c2c2c] dark:border-[#555] rounded-xl transition-all ${
            snapshot.isDragging
              ? 'rotate-2 scale-105 shadow-[6px_6px_0px_0px_#e07a5f] z-50 ring-2 ring-[#e07a5f]'
              : 'shadow-[3px_3px_0px_0px_#2c2c2c] dark:shadow-[3px_3px_0px_0px_#555] hover:shadow-[5px_5px_0px_0px_#2c2c2c] dark:hover:shadow-[5px_5px_0px_0px_#777] hover:-translate-y-0.5'
          }`}
          onClick={() => !isEditingTitle && onCardClick(card)}
        >
          {/* Card Top Action Bar */}
          <div className="flex items-start justify-between gap-2 mb-2">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  onBlur={handleTitleSubmit}
                  className="w-full px-2 py-1 text-base font-hand font-bold bg-[#f4f1de] dark:bg-[#2a2a36] text-[#2c2c2c] dark:text-[#f4f1de] border border-[#2c2c2c] rounded focus:outline-none focus:ring-1 focus:ring-[#e07a5f]"
                  autoFocus
                />
              </form>
            ) : (
              <h4
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="font-hand font-bold text-lg text-[#2c2c2c] dark:text-[#f4f1de] leading-snug cursor-pointer select-none flex-1 group-hover:text-[#e07a5f] transition-colors"
                title="Click to view details, Double click to edit title"
              >
                {card.title}
              </h4>
            )}

            {/* Delete button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-opacity"
              title="Delete card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Card Description Preview */}
          {card.description && (
            <p className="text-xs font-sans text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {card.description}
            </p>
          )}

          {/* Card Footer: Assigned Members & Last Updated Attribution */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            {/* Assigned Member Avatars */}
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {card.assigned_to && card.assigned_to.length > 0 ? (
                card.assigned_to.map((member, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border border-[#2c2c2c] dark:border-[#555] bg-[#81b29a] text-[#121212] flex items-center justify-center font-bold text-[10px] font-sans shadow-sm"
                    title={`Assigned to ${member}`}
                  >
                    {member.charAt(0).toUpperCase()}
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-sans text-gray-400 italic">Unassigned</span>
              )}
            </div>

            {/* Last Updated Attribution */}
            <div
              className="flex items-center gap-1 font-sans text-[11px] bg-[#f4f1de]/70 dark:bg-[#2a2a34] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              title={`Last edited by ${card.updated_by} at ${formattedTime}`}
            >
              <Clock className="w-3 h-3 text-[#e07a5f]" />
              <span className="font-semibold">{card.updated_by}</span>
              <span className="text-[10px] opacity-75">{formattedTime}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
