import { User, Column, Card } from '../types/kanban';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_USERS = 'excali_kanban_users';
const STORAGE_KEY_COLUMNS = 'excali_kanban_columns';
const STORAGE_KEY_CARDS = 'excali_kanban_cards';
const STORAGE_KEY_CURRENT_USER = 'excali_kanban_current_user';

// Seed Defaults
const DEFAULT_USERS: User[] = [
  { id: 'usr-1', name: 'Alex' },
  { id: 'usr-2', name: 'Sam' },
  { id: 'usr-3', name: 'Jordan' },
];

const DEFAULT_COLUMNS: Column[] = [
  { id: 'col-backlog', name: 'Backlog', position: 0 },
  { id: 'col-ongoing', name: 'On-going', position: 1 },
  { id: 'col-done', name: 'Done', position: 2 },
];

const DEFAULT_CARDS: Card[] = [
  {
    id: 'card-1',
    column_id: 'col-backlog',
    title: '✏️ Design Excalidraw aesthetic UI',
    description: 'Use hand-drawn font, sketchy borders, and smooth drag and drop.',
    assigned_to: ['Alex'],
    position: 0,
    updated_by: 'Alex',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'card-2',
    column_id: 'col-ongoing',
    title: '🚀 Setup Supabase Realtime & Netlify config',
    description: 'Ensure multi-user realtime sync works out of the box.',
    assigned_to: ['Sam', 'Jordan'],
    position: 0,
    updated_by: 'Sam',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'card-3',
    column_id: 'col-done',
    title: '🎉 Initialize workspace repository',
    description: 'Package json, Tailwind CSS, TypeScript setup complete.',
    assigned_to: ['Jordan'],
    position: 0,
    updated_by: 'Jordan',
    updated_at: new Date().toISOString(),
  },
];

// Helper to broadcast changes locally (between tabs)
const broadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel('excali_kanban_sync') : null;

export class StorageService {
  // Current User management
  static getCurrentUser(): string | null {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  }

  static setCurrentUser(name: string): void {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, name);
    this.addOrGetUser(name);
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }

  // --- Users ---
  static async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    }

    const local = localStorage.getItem(STORAGE_KEY_USERS);
    if (local !== null) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  static async addOrGetUser(name: string): Promise<User> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('User name cannot be empty');

    const users = await this.getUsers();
    const existing = users.find((u) => u.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('users').insert({ id: newUser.id, name: trimmed });
    }

    const updated = [...users, newUser];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'USERS_UPDATED' });
    return newUser;
  }

  static async deleteUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const updatedUsers = users.filter((u) => u.id !== user.id && u.name !== user.name);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('users').delete().eq('name', user.name);
    }

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

    // Remove user from card assignments
    const cards = await this.getCards();
    const updatedCards = cards.map((card) => {
      if (card.assigned_to.includes(user.name)) {
        return {
          ...card,
          assigned_to: card.assigned_to.filter((n) => n !== user.name),
        };
      }
      return card;
    });
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updatedCards));

    // Clear active user if it was the deleted user
    if (this.getCurrentUser() === user.name) {
      this.clearCurrentUser();
    }

    broadcastChannel?.postMessage({ type: 'USERS_UPDATED' });
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  // --- Columns ---
  static async getColumns(): Promise<Column[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('columns').select('*').order('position');
      if (!error && data) return data;
    }

    const local = localStorage.getItem(STORAGE_KEY_COLUMNS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(DEFAULT_COLUMNS));
    return DEFAULT_COLUMNS;
  }

  static async addColumn(name: string): Promise<Column> {
    const columns = await this.getColumns();
    const newCol: Column = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'New Column',
      position: columns.length,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('columns').insert(newCol);
    }

    const updated = [...columns, newCol];
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
    return newCol;
  }

  static async updateColumn(id: string, name: string): Promise<void> {
    const columns = await this.getColumns();
    const updated = columns.map((col) => (col.id === id ? { ...col, name } : col));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('columns').update({ name }).eq('id', id);
    }

    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  static async deleteColumn(id: string): Promise<void> {
    const columns = await this.getColumns();
    const cards = await this.getCards();

    const updatedCols = columns.filter((col) => col.id !== id);
    const updatedCards = cards.filter((card) => card.column_id !== id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('columns').delete().eq('id', id);
    }

    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(updatedCols));
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updatedCards));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  // --- Cards ---
  static async getCards(): Promise<Card[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cards').select('*').order('position');
      if (!error && data) return data;
    }

    const local = localStorage.getItem(STORAGE_KEY_CARDS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(DEFAULT_CARDS));
    return DEFAULT_CARDS;
  }

  static async addCard(columnId: string, title: string, currentUser: string): Promise<Card> {
    const cards = await this.getCards();
    const colCards = cards.filter((c) => c.column_id === columnId);

    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      column_id: columnId,
      title: title.trim(),
      description: '',
      assigned_to: [currentUser],
      position: colCards.length,
      updated_by: currentUser,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('cards').insert(newCard);
    }

    const updated = [...cards, newCard];
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
    return newCard;
  }

  static async updateCard(card: Card, currentUser: string): Promise<void> {
    const cards = await this.getCards();
    const updatedCard: Card = {
      ...card,
      updated_by: currentUser,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('cards').update(updatedCard).eq('id', card.id);
    }

    const updated = cards.map((c) => (c.id === card.id ? updatedCard : c));
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  static async moveCard(
    cardId: string,
    targetColumnId: string,
    newPosition: number,
    currentUser: string
  ): Promise<void> {
    const cards = await this.getCards();
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    // Filter out target card
    const remaining = cards.filter((c) => c.id !== cardId);

    // Get cards in target column sorted by position
    const targetColCards = remaining
      .filter((c) => c.column_id === targetColumnId)
      .sort((a, b) => a.position - b.position);

    // Insert target card into new position
    targetColCards.splice(newPosition, 0, {
      ...targetCard,
      column_id: targetColumnId,
      updated_by: currentUser,
      updated_at: new Date().toISOString(),
    });

    // Re-assign position indices for target column
    const reindexedTarget = targetColCards.map((card, idx) => ({
      ...card,
      position: idx,
    }));

    // Combine with unaffected cards from other columns
    const unaffected = remaining.filter((c) => c.column_id !== targetColumnId);
    const finalCards = [...unaffected, ...reindexedTarget];

    if (isSupabaseConfigured && supabase) {
      // Upsert batch in Supabase
      const cardToUpdate = reindexedTarget.find((c) => c.id === cardId);
      if (cardToUpdate) {
        await supabase.from('cards').update({
          column_id: targetColumnId,
          position: newPosition,
          updated_by: currentUser,
          updated_at: new Date().toISOString(),
        }).eq('id', cardId);
      }
    }

    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(finalCards));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  static async deleteCard(id: string): Promise<void> {
    const cards = await this.getCards();
    const updated = cards.filter((c) => c.id !== id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('cards').delete().eq('id', id);
    }

    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updated));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  // Subscribe to Realtime Updates (Supabase + Local BroadcastChannel)
  static subscribeToChanges(onUpdate: () => void): () => void {
    const handleBroadcast = () => onUpdate();
    broadcastChannel?.addEventListener('message', handleBroadcast);

    let supabaseChannel: any = null;

    if (isSupabaseConfigured && supabase) {
      supabaseChannel = (supabase as any)
        .channel('kanban_realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          onUpdate();
        })
        .subscribe();
    }

    return () => {
      broadcastChannel?.removeEventListener('message', handleBroadcast);
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }
}
