import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, Card, User } from '../types/kanban';
import { KanbanCard } from './KanbanCard';
import { Plus, Trash2, Edit3, X, Check } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  workspaceUsers: User[];
  currentUser: string;
  onCardClick: (card: Card) => void;
  onUpdateTitle: (cardId: string, newTitle: string) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (columnId: string, cardTitle: string) => void;
  onRenameColumn: (columnId: string, newName: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  workspaceUsers,
  currentUser,
  onCardClick,
  onUpdateTitle,
  onDeleteCard,
  onAddCard,
  onRenameColumn,
  onDeleteColumn,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);

  // Trello-style inline card creation
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnName.trim()) {
      onRenameColumn(column.id, columnName.trim());
    } else {
      setColumnName(column.name);
    }
    setIsEditingName(false);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-[#f4f1de]/60 dark:bg-[#18181e] border-2 border-[#2c2c2c] dark:border-[#555] rounded-2xl p-3 shadow-[5px_5px_0px_0px_#2c2c2c] dark:shadow-[5px_5px_0px_0px_#555] max-h-[82vh]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b-2 border-dashed border-[#2c2c2c]/30 dark:border-[#555]/50">
        {isEditingName ? (
          <form onSubmit={handleRenameSubmit} className="flex-1 flex items-center gap-1">
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full px-2 py-1 text-lg font-hand font-bold bg-white dark:bg-[#282834] text-[#2c2c2c] dark:text-[#f4f1de] border-2 border-[#2c2c2c] rounded-lg focus:outline-none"
              autoFocus
              onBlur={handleRenameSubmit}
            />
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <h3
              onDoubleClick={() => setIsEditingName(true)}
              className="font-hand font-bold text-xl text-[#2c2c2c] dark:text-[#f4f1de] cursor-pointer select-none hover:text-[#e07a5f] transition-colors"
              title="Double click to rename column"
            >
              {column.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold font-sans rounded-full bg-white dark:bg-[#282834] border border-[#2c2c2c] dark:border-[#555] text-gray-700 dark:text-gray-300">
              {cards.length}
            </span>
          </div>
        )}

        {/* Delete Column Action */}
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Delete column"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List Drop Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-1 py-1 min-h-[120px] rounded-xl transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-[#81b29a]/20 dark:bg-[#81b29a]/10 border-2 border-dashed border-[#81b29a]'
                : ''
            }`}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                workspaceUsers={workspaceUsers}
                onCardClick={onCardClick}
                onUpdateTitle={onUpdateTitle}
                onDeleteCard={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Bottom Trello-style Inline "+ Add a card" Section */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        {isAddingCard ? (
          <form onSubmit={handleAddCardSubmit} className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full p-2.5 text-sm font-hand font-bold bg-white dark:bg-[#22222a] text-[#2c2c2c] dark:text-[#f4f1de] border-2 border-[#2c2c2c] dark:border-[#555] rounded-xl focus:outline-none shadow-[2px_2px_0px_0px_#2c2c2c] resize-none"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit(e);
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="sketch-button px-3 py-1.5 bg-[#e07a5f] text-white text-sm font-hand font-bold rounded-lg"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-hand font-bold text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-[#282834] rounded-xl transition-all sketch-border border-dashed hover:border-solid text-left"
          >
            <Plus className="w-4 h-4 text-[#e07a5f]" />
            <span>+ Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
};
