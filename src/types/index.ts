export interface Project {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  content: string;
  x: number;
  y: number;
  children?: string[];
}

export interface MindMap {
  id: string;
  chat_id: string;
  data: {
    nodes: MindMapNode[];
    title: string;
  };
  created_at: string;
  updated_at: string;
}
