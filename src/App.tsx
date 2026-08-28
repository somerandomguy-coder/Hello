import React, { useEffect, useState } from 'react';
import { StorageService } from './lib/storage';
import { Column, Card, User } from './types/kanban';
import { Navbar } from './components/Navbar';
import { UserSelectionModal } from './components/UserSelectionModal';
import { KanbanBoard } from './components/KanbanBoard';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('excali_dark_mode') === 'true';
  });

  const loadData = async () => {
    const loadedUsers = await StorageService.getUsers();
    const loadedCols = await StorageService.getColumns();
    const loadedCards = await StorageService.getCards();

    setUsers(loadedUsers);
    setColumns(loadedCols);
    setCards(loadedCards);
  };

  useEffect(() => {
    const savedUser = StorageService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    loadData();

    // Subscribe to realtime database / tab broadcast changes
    const unsubscribe = StorageService.subscribeToChanges(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('excali_dark_mode', String(darkMode));
  }, [darkMode]);

  const handleSelectUser = async (userName: string) => {
    StorageService.setCurrentUser(userName);
    setCurrentUser(userName);
    await loadData();
  };

  const handleMoveCard = async (
    cardId: string,
    targetColumnId: string,
    newPosition: number
  ) => {
    if (!currentUser) return;

    // Check if moving to "Done" column for celebratory confetti!
    const targetCol = columns.find((c) => c.id === targetColumnId);
    if (targetCol && targetCol.name.toLowerCase().includes('done')) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    await StorageService.moveCard(cardId, targetColumnId, newPosition, currentUser);
    await loadData();
  };

  const handleAddCard = async (columnId: string, cardTitle: string) => {
    if (!currentUser) return;
    await StorageService.addCard(columnId, cardTitle, currentUser);
    await loadData();
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    if (!currentUser) return;
    await StorageService.updateCard(updatedCard, currentUser);
    await loadData();
  };

  const handleDeleteCard = async (cardId: string) => {
    await StorageService.deleteCard(cardId);
    await loadData();
  };

  const handleAddColumn = async (name: string) => {
    await StorageService.addColumn(name);
    await loadData();
  };

  const handleRenameColumn = async (columnId: string, newName: string) => {
    await StorageService.updateColumn(columnId, newName);
    await loadData();
  };

  const handleDeleteColumn = async (columnId: string) => {
    await StorageService.deleteColumn(columnId);
    await loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] dark:bg-[#121214] text-[#2c2c2c] dark:text-[#e4e4e7] transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        onSwitchUser={() => {
          StorageService.clearCurrentUser();
          setCurrentUser(null);
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {!currentUser ? (
        <UserSelectionModal
          existingUsers={users}
          onSelectUser={handleSelectUser}
        />
      ) : (
        <main className="flex-1 flex flex-col">
          <KanbanBoard
            columns={columns}
            cards={cards}
            workspaceUsers={users}
            currentUser={currentUser}
            onMoveCard={handleMoveCard}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onAddColumn={handleAddColumn}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={handleDeleteColumn}
          />
        </main>
      )}
    </div>
  );
};
