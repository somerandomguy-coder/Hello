export interface User {
  id: string;
  name: string;
  created_at?: string;
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  assigned_to: string[]; // List of user names
  position: number;
  updated_by: string; // User name who performed last edit/move
  updated_at: string; // ISO string
}

export interface Column {
  id: string;
  name: string;
  position: number;
}

export interface KanbanState {
  users: User[];
  columns: Column[];
  cards: Card[];
  currentUser: string | null;
}
