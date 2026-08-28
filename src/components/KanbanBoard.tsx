import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column, Card, User } from '../types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { CardDetailModal } from './CardDetailModal';
import { Plus, Layout } from 'lucide-react';

interface KanbanBoardProps {
  columns: Column[];
  cards: Card[];
  workspaceUsers: User[];
  currentUser: string;
  onMoveCard: (cardId: string, targetColumnId: string, newPosition: number) => void;
  onAddCard: (columnId: string, cardTitle: string) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onAddColumn: (name: string) => void;
  onRenameColumn: (columnId: string, newName: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  cards,
  workspaceUsers,
  currentUser,
  onMoveCard,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
}) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // New Column inline creation state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onMoveCard(draggableId, destination.droppableId, destination.index);
  };

  const handleCreateColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex items-start gap-5 min-w-max pb-4">
          {columns
            .sort((a, b) => a.position - b.position)
            .map((col) => {
              const colCards = cards
                .filter((card) => card.column_id === col.id)
                .sort((a, b) => a.position - b.position);

              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  cards={colCards}
                  workspaceUsers={workspaceUsers}
                  currentUser={currentUser}
                  onCardClick={(card) => setSelectedCard(card)}
                  onUpdateTitle={(cardId, newTitle) => {
                    const target = cards.find((c) => c.id === cardId);
                    if (target) {
                      onUpdateCard({ ...target, title: newTitle });
                    }
                  }}
                  onDeleteCard={onDeleteCard}
                  onAddCard={onAddCard}
                  onRenameColumn={onRenameColumn}
                  onDeleteColumn={onDeleteColumn}
                />
              );
            })}

          {/* Add New Column Button / Input */}
          <div className="w-72 flex-shrink-0">
            {isAddingColumn ? (
              <form
                onSubmit={handleCreateColumnSubmit}
                className="p-3 bg-white dark:bg-[#18181e] border-2 border-[#2c2c2c] dark:border-[#555] rounded-2xl shadow-[4px_4px_0px_0px_#2c2c2c] dark:shadow-[4px_4px_0px_0px_#555] space-y-3"
              >
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column title (e.g. In Review)..."
                  className="w-full px-3 py-2 text-base font-hand font-bold bg-[#faf9f5] dark:bg-[#24242e] text-[#2c2c2c] dark:text-[#f4f1de] border-2 border-[#2c2c2c] dark:border-[#555] rounded-xl focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="sketch-button flex-1 py-1.5 bg-[#81b29a] text-black font-hand font-bold rounded-lg text-sm"
                  >
                    Add Board
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }}
                    className="px-3 py-1.5 text-gray-500 font-hand font-bold hover:underline text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full py-4 px-4 flex items-center justify-center gap-2 border-2 border-dashed border-[#2c2c2c]/40 dark:border-[#555]/60 hover:border-solid hover:border-[#e07a5f] bg-[#f4f1de]/40 dark:bg-[#18181e]/40 hover:bg-white dark:hover:bg-[#18181e] text-[#2c2c2c] dark:text-[#f4f1de] font-hand font-bold text-xl rounded-2xl transition-all shadow-[2px_2px_0px_0px_#2c2c2c]/20"
              >
                <Plus className="w-5 h-5 text-[#e07a5f]" />
                <span>Add column</span>
              </button>
            )}
          </div>
        </div>
      </DragDropContext>

      {/* Detailed Card View Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          columns={columns}
          workspaceUsers={workspaceUsers}
          currentUser={currentUser}
          onSave={(updatedCard) => {
            onUpdateCard(updatedCard);
            setSelectedCard(null);
          }}
          onDelete={(cardId) => {
            onDeleteCard(cardId);
            setSelectedCard(null);
          }}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};
