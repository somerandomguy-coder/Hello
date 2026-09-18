import { User, Column, Card } from '../types/kanban';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_USERS = 'excali_kanban_users';
const STORAGE_KEY_COLUMNS = 'excali_kanban_columns';
const STORAGE_KEY_CARDS = 'excali_kanban_cards';
const STORAGE_KEY_CURRENT_USER = 'excali_kanban_current_user';

const LEGACY_DEFAULT_NAMES = ['Alex', 'Sam', 'Jordan'];

// Default users empty so users start fresh
const DEFAULT_USERS: User[] = [];

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
    assigned_to: [],
    position: 0,
    updated_by: 'System',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'card-2',
    column_id: 'col-ongoing',
    title: '🚀 Setup Supabase Realtime & Netlify config',
    description: 'Ensure multi-user realtime sync works out of the box.',
    assigned_to: [],
    position: 0,
    updated_by: 'System',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'card-3',
    column_id: 'col-done',
    title: '🎉 Initialize workspace repository',
    description: 'Package json, Tailwind CSS, TypeScript setup complete.',
    assigned_to: [],
    position: 0,
    updated_by: 'System',
    updated_at: new Date().toISOString(),
  },
];

// Helper to broadcast changes locally (between tabs)
const broadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel('excali_kanban_sync') : null;

export class StorageService {
  // Current User management
  static getCurrentUser(): string | null {
    const current = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (current && LEGACY_DEFAULT_NAMES.includes(current)) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      return null;
    }
    return current;
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
    let usersList: User[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error) {
        console.error('[Supabase] Error fetching users:', error);
      }
      if (!error && data) {
        usersList = data;
      }
    } else {
      const local = localStorage.getItem(STORAGE_KEY_USERS);
      if (local !== null) {
        try {
          usersList = JSON.parse(local);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Filter out legacy seed names ('Alex', 'Sam', 'Jordan')
    const filteredUsers = usersList.filter(
      (u) => !LEGACY_DEFAULT_NAMES.includes(u.name)
    );

    // Save cleaned list back to local storage
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filteredUsers));

    // Also delete legacy names from Supabase if configured
    if (isSupabaseConfigured && supabase && usersList.some(u => LEGACY_DEFAULT_NAMES.includes(u.name))) {
      await supabase.from('users').delete().in('name', LEGACY_DEFAULT_NAMES);
    }

    return filteredUsers;
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
      const { error } = await supabase.from('users').insert({ id: newUser.id, name: trimmed });
      if (error) {
        console.error('[Supabase] Error adding user:', error);
      }
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
      const { error } = await supabase.from('users').delete().eq('name', user.name);
      if (error) {
        console.error('[Supabase] Error deleting user:', error);
      }
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
      if (error) {
        console.error('[Supabase] Error fetching columns:', error);
      }
      if (!error && data && data.length > 0) return data;
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
      const { error } = await supabase.from('columns').insert(newCol);
      if (error) console.error('[Supabase] Error adding column:', error);
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
      const { error } = await supabase.from('columns').update({ name }).eq('id', id);
      if (error) console.error('[Supabase] Error updating column:', error);
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
      const { error } = await supabase.from('columns').delete().eq('id', id);
      if (error) console.error('[Supabase] Error deleting column:', error);
    }

    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(updatedCols));
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updatedCards));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  // --- Cards ---
  static async getCards(): Promise<Card[]> {
    let cardsList: Card[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cards').select('*').order('position');
      if (error) {
        console.error('[Supabase] Error fetching cards:', error);
      }
      if (!error && data && data.length > 0) cardsList = data;
    }

    if (cardsList.length === 0) {
      const local = localStorage.getItem(STORAGE_KEY_CARDS);
      if (local) {
        try {
          cardsList = JSON.parse(local);
        } catch (e) {
          console.error(e);
        }
      } else {
        cardsList = DEFAULT_CARDS;
      }
    }

    // Clean legacy names from card assignments & updated_by
    const cleanedCards = cardsList.map((card) => {
      const cleanAssigned = (card.assigned_to || []).filter(
        (name) => !LEGACY_DEFAULT_NAMES.includes(name)
      );
      const cleanUpdatedBy = LEGACY_DEFAULT_NAMES.includes(card.updated_by)
        ? 'System'
        : card.updated_by;
      return {
        ...card,
        assigned_to: cleanAssigned,
        updated_by: cleanUpdatedBy,
      };
    });

    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cleanedCards));
    return cleanedCards;
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
      const { error } = await supabase.from('cards').insert(newCard);
      if (error) console.error('[Supabase] Error adding card:', error);
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
      const { error } = await supabase.from('cards').update(updatedCard).eq('id', card.id);
      if (error) console.error('[Supabase] Error updating card:', error);
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

    const remaining = cards.filter((c) => c.id !== cardId);
    const targetColCards = remaining
      .filter((c) => c.column_id === targetColumnId)
      .sort((a, b) => a.position - b.position);

    targetColCards.splice(newPosition, 0, {
      ...targetCard,
      column_id: targetColumnId,
      updated_by: currentUser,
      updated_at: new Date().toISOString(),
    });

    const reindexedTarget = targetColCards.map((card, idx) => ({
      ...card,
      position: idx,
    }));

    const unaffected = remaining.filter((c) => c.column_id !== targetColumnId);
    const finalCards = [...unaffected, ...reindexedTarget];

    if (isSupabaseConfigured && supabase) {
      const cardToUpdate = reindexedTarget.find((c) => c.id === cardId);
      if (cardToUpdate) {
        const { error } = await supabase.from('cards').update({
          column_id: targetColumnId,
          position: newPosition,
          updated_by: currentUser,
          updated_at: new Date().toISOString(),
        }).eq('id', cardId);
        if (error) console.error('[Supabase] Error moving card:', error);
      }
    }

    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(finalCards));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED' });
  }

  static async deleteCard(id: string): Promise<void> {
    const cards = await this.getCards();
    const updated = cards.filter((c) => c.id !== id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) console.error('[Supabase] Error deleting card:', error);
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
